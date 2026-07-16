const dataInput = document.getElementById('data');
const qrColorInput = document.getElementById('qrColor');
const bgColorInput = document.getElementById('bgColor');
const sizeInput = document.getElementById('size');
const sizeValue = document.getElementById('sizeValue');
const marginInput = document.getElementById('margin');
const marginValue = document.getElementById('marginValue');
const errorLevelInput = document.getElementById('errorLevel');
const dotTypeInput = document.getElementById('dotType');
const cornerSquareTypeInput = document.getElementById('cornerSquareType');
const cornerDotTypeInput = document.getElementById('cornerDotType');
const cornerColorInput = document.getElementById('cornerColor');
const logoInput = document.getElementById('logo');
const logoSizeInput = document.getElementById('logoSize');
const logoSizeValue = document.getElementById('logoSizeValue');
const logoMarginInput = document.getElementById('logoMargin');
const logoMarginValue = document.getElementById('logoMarginValue');
const downloadPng = document.getElementById('downloadPng');
const downloadSvg = document.getElementById('downloadSvg');
const resetButton = document.getElementById('reset');
const presetSelect = document.getElementById('preset');
const copyPng = document.getElementById('copyPng');

const previewElement = document.getElementById('preview');

// Create QRCodeStyling instance with safe defaults if some elements are missing
const qr = new QRCodeStyling({
  width: Number(sizeInput?.value || 360),
  height: Number(sizeInput?.value || 360),
  data: dataInput?.value || 'https://example.com',
  margin: Number(marginInput?.value || 8),
  qrOptions: { errorCorrectionLevel: errorLevelInput?.value || 'M' },
  dotsOptions: { color: qrColorInput?.value || '#000', type: dotTypeInput?.value || 'square' },
  cornersSquareOptions: { color: cornerColorInput?.value || '#000', type: cornerSquareTypeInput?.value || 'square' },
  cornersDotOptions: { type: cornerDotTypeInput?.value || 'dot' },
  backgroundOptions: { color: bgColorInput?.value || '#fff' },
  imageOptions: { crossOrigin: 'anonymous', margin: Number(logoMarginInput?.value || 2), imageSize: Number(logoSizeInput?.value || 20) / 100 },
});

qr.append(previewElement);

function updatePreview() {
  if (sizeValue) sizeValue.textContent = `${sizeInput.value}px`;
  if (marginValue) marginValue.textContent = marginInput.value;  if (logoSizeValue) logoSizeValue.textContent = `${logoSizeInput.value}%`;  if (logoMarginValue) logoMarginValue.textContent = logoMarginInput.value;

  qr.update({
    width: Number(sizeInput.value),
    height: Number(sizeInput.value),
    data: dataInput.value,
    margin: Number(marginInput.value),
    qrOptions: { errorCorrectionLevel: errorLevelInput.value },
    dotsOptions: { color: qrColorInput.value, type: dotTypeInput.value },
    cornersSquareOptions: { color: cornerColorInput.value, type: cornerSquareTypeInput.value },
    cornersDotOptions: { type: cornerDotTypeInput.value },
    backgroundOptions: { color: bgColorInput.value },
    imageOptions: { margin: Number(logoMarginInput.value), imageSize: Number(logoSizeInput.value) / 100 },
  });
}

function applyPreset(preset) {
  switch (preset) {
    case 'purple':
      // Morado recomendado
      qrColorInput.value = '#7c3aed';
      bgColorInput.value = '#0b0720';
      dotTypeInput.value = 'rounded';
      cornerColorInput.value = '#c4b5fd';
      break;
    case 'invert':
      qrColorInput.value = '#ffffff';
      bgColorInput.value = '#0b1020';
      dotTypeInput.value = 'rounded';
      cornerColorInput.value = '#ffffff';
      break;
    case 'soft':
      qrColorInput.value = '#2b3a67';
      bgColorInput.value = '#f6f9ff';
      dotTypeInput.value = 'rounded';
      cornerColorInput.value = '#2b3a67';
      break;
    case 'neon':
      qrColorInput.value = '#00ffd1';
      bgColorInput.value = '#03021a';
      dotTypeInput.value = 'dots';
      cornerColorInput.value = '#ff00d0';
      break;
    default:
      // fallback classic
      qrColorInput.value = '#000000';
      bgColorInput.value = '#ffffff';
      dotTypeInput.value = 'square';
      cornerColorInput.value = '#000000';
  }
  updatePreview();
}

function setDefaultState() {
  dataInput.value = 'https://example.com';
  qrColorInput.value = '#000000';
  bgColorInput.value = '#ffffff';
  sizeInput.value = '360';
  marginInput.value = '8';
  errorLevelInput.value = 'M';
  dotTypeInput.value = 'square';
  cornerSquareTypeInput.value = 'square';
  cornerDotTypeInput.value = 'dot';
  cornerColorInput.value = '#000000';
  logoSizeInput.value = '20';
  logoMarginInput.value = '2';
  if (logoInput) logoInput.value = '';
  if (logoSizeValue) logoSizeValue.textContent = '20%';
  if (sizeValue) sizeValue.textContent = '360px';
  if (marginValue) marginValue.textContent = '8';
  if (logoMarginValue) logoMarginValue.textContent = '2';

  qr.update({ data: dataInput.value, image: '' });
  updatePreview();
}

function attachListeners() {
  const inputs = [
    dataInput,
    qrColorInput,
    bgColorInput,
    sizeInput,
    marginInput,
    errorLevelInput,
    dotTypeInput,
    cornerSquareTypeInput,
    cornerDotTypeInput,
    cornerColorInput,
    logoSizeInput,
    logoMarginInput,
  ].filter(Boolean);

  inputs.forEach((input) => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
  });

  if (logoInput) {
    logoInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (!file) {
        qr.update({ image: '' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        qr.update({ image: reader.result });
      };
      reader.readAsDataURL(file);
    });
  }

  if (downloadPng) {
    downloadPng.addEventListener('click', () => {
      qr.download({ name: 'qr-personalizado', extension: 'png' });
    });
  }

  if (downloadSvg) {
    downloadSvg.addEventListener('click', () => {
      qr.download({ name: 'qr-personalizado', extension: 'svg' });
    });
  }

  if (resetButton) {
    resetButton.addEventListener('click', () => {
      setDefaultState();
      if (presetSelect) presetSelect.value = 'purple';
      if (presetSelect) applyPreset(presetSelect.value);
    });
  }

  if (presetSelect) {
    presetSelect.addEventListener('change', (e) => {
      applyPreset(e.target.value);
    });
  }

  if (copyPng) {
    copyPng.addEventListener('click', async () => {
      try {
        // First try to find a canvas inside preview (most browsers)
        const canvas = previewElement.querySelector('canvas');
        if (canvas && canvas.toBlob) {
          canvas.toBlob(async (blob) => {
            try {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
              alert('Imagen copiada al portapapeles');
            } catch (err) {
              alert('No se pudo copiar al portapapeles: ' + err.message);
            }
          });
          return;
        }

        // If SVG, serialize and render to canvas then copy
        const svg = previewElement.querySelector('svg');
        if (svg) {
          const xml = new XMLSerializer().serializeToString(svg);
          const svg64 = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const c = document.createElement('canvas');
            c.width = img.width; c.height = img.height;
            const ctx = c.getContext('2d');
            ctx.drawImage(img, 0, 0);
            c.toBlob(async (blob) => {
              try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                alert('Imagen copiada al portapapeles');
              } catch (err) {
                alert('No se pudo copiar al portapapeles: ' + err.message);
              }
            });
          };
          img.src = svg64;
          return;
        }

        alert('No se encontró la imagen para copiar. Intenta descargarla.');
      } catch (err) {
        alert('Error al copiar: ' + err.message);
      }
    });
  }
}

attachListeners();
// Apply selected preset on load (preset defaults to 'purple' in the HTML)
if (presetSelect) applyPreset(presetSelect.value);
updatePreview();

