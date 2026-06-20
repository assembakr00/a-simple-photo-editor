const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const brightness = document.getElementById('brightness');
const contrast = document.getElementById('contrast');
const saturate = document.getElementById('saturate');
const presetSelect = document.getElementById('presetSelect');
const downloadBtn = document.getElementById('downloadBtn');
const aiBtn = document.getElementById('aiBtn');
const apiUrlInput = document.getElementById('apiUrl');
const apiKeyInput = document.getElementById('apiKey');

let img = new Image();
let currentDataUrl = null;

fileInput.addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = ev => {
    img = new Image();
    img.onload = () => drawImage();
    img.src = ev.target.result;
    currentDataUrl = ev.target.result;
  };
  reader.readAsDataURL(f);
});

[brightness, contrast, saturate].forEach(el => el.addEventListener('input', drawImage));
presetSelect.addEventListener('change', () => { applyPreset(presetSelect.value); drawImage(); });
downloadBtn.addEventListener('click', downloadImage);
aiBtn.addEventListener('click', handleAI);

function drawImage(){
  if (!img || !img.src) return;
  const maxDim = 1200;
  let w = img.width, h = img.height;
  const scale = Math.min(1, maxDim / Math.max(w,h));
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);

  const filter = `brightness(${brightness.value}) contrast(${contrast.value}) saturate(${saturate.value})`;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  ctx.save();
  ctx.filter = filter;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  ctx.restore();

  // subtle vignette overlay
  const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, Math.min(canvas.width,canvas.height)/4, canvas.width/2, canvas.height/2, Math.max(canvas.width,canvas.height)/1.2);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

function applyPreset(name){
  switch(name){
    case 'vivid': brightness.value = 1.05; contrast.value = 1.15; saturate.value = 1.4; break;
    case 'mono': brightness.value = 1; contrast.value = 1.05; saturate.value = 0; break;
    case 'warm': brightness.value = 1.03; contrast.value = 1.05; saturate.value = 1.1; break;
    case 'cool': brightness.value = 0.98; contrast.value = 1.02; saturate.value = 1.05; break;
    default: brightness.value = 1; contrast.value = 1; saturate.value = 1; break;
  }
}

function downloadImage(){
  if (!canvas.toDataURL) return alert('Nothing to download yet');
  const data = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = data;
  a.download = 'mix-edit.png';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

async function handleAI(){
  if (!canvas.toDataURL) return alert('No image to send');
  const apiUrl = apiUrlInput.value.trim();
  if (!apiUrl) return alert('Provide an AI API endpoint to use AI edits (optional).');
  const apiKey = apiKeyInput.value.trim();
  const dataUrl = canvas.toDataURL('image/png');

  aiBtn.disabled = true; aiBtn.textContent = 'Processing...';
  try{
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey?{ 'Authorization': 'Bearer ' + apiKey }:{})
      },
      body: JSON.stringify({ image: dataUrl })
    });
    if (!res.ok) throw new Error('AI API returned ' + res.status);
    const json = await res.json();
    if (json && json.image){
      const newImg = new Image();
      newImg.onload = ()=>{ img = newImg; drawImage(); aiBtn.disabled=false; aiBtn.textContent='Apply AI Edit'; };
      newImg.src = json.image;
    } else {
      throw new Error('AI response missing image');
    }
  }catch(err){
    alert('AI edit failed: ' + err.message);
    aiBtn.disabled=false; aiBtn.textContent='Apply AI Edit';
  }
}
