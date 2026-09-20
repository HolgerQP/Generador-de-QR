const $ = (id) => document.getElementById(id);

const dataInput = $('data');
const qrColorInput = $('qrColor');
const bgColorInput = $('bgColor');
const sizeInput = $('size');
const sizeValue = $('sizeValue');
const marginInput = $('margin');
const marginValue = $('marginValue');
const errorLevelInput = $('errorLevel');
const dotTypeInput = $('dotType');
const cornerSquareTypeInput = $('cornerSquareType');
const cornerDotTypeInput = $('cornerDotType');
const cornerColorInput = $('cornerColor');
const logoInput = $('logo');
const logoSizeInput = $('logoSize');
const logoSizeValue = $('logoSizeValue');
const logoMarginInput = $('logoMargin');
const logoMarginValue = $('logoMarginValue');
const downloadPng = $('downloadPng');
const downloadSvg = $('downloadSvg');
const resetButton = $('reset');
const presetSelect = $('preset');
const copyPng = $('copyPng');
const removeLogo = $('removeLogo');
const previewElement = $('preview');
const charCount = $('charCount');
const dataHint = $('dataHint');
const previewStatus = $('previewStatus');
const previewMessage = $('previewMessage');
const toast = $('toast');

const DEFAULTS = {
  data: 'https://example.com',
  qrColor: '#111827',
  bgColor: '#ffffff',
  size: '360',
  margin: '8',
  errorLevel: 'M',
  dotType: 'square',
  cornerSquareType: 'square',
  cornerDotType: 'dot',
  cornerColor: '#111827',
  logoSize: '20',
  logoMargin: '2',
};

let logoData = '';
let toastTimer;

const qr = new QRCodeStyling({
  width: Number(DEFAULTS.size),
  height: Number(DEFAULTS.size),
  data: DEFAULTS.data,
  margin: Number(DEFAULTS.margin),
  qrOptions: { errorCorrectionLevel: DEFAULTS.errorLevel },
  dotsOptions: { color: DEFAULTS.qrColor, type: DEFAULTS.dotType },
  cornersSquareOptions: { color: DEFAULTS.cornerColor, type: DEFAULTS.cornerSquareType },
  cornersDotOptions: { color: DEFAULTS.cornerColor, type: DEFAULTS.cornerDotType },
  backgroundOptions: { color: DEFAULTS.bgColor },
  imageOptions: {
    crossOrigin: 'anonymous',
    margin: Number(DEFAULTS.logoMargin),
    imageSize: Number(DEFAULTS.logoSize) / 100,
    hideBackgroundDots: true,
  },
});

qr.append(previewElement);

function showToast(message, type = 'success') {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.className = `toast show${type === 'error' ? ' error' : ''}`;
  toastTimer = setTimeout(() => { toast.className = 'toast'; }, 2400);
}

function updateLabels() {
  sizeValue.textContent = `${sizeInput.value}px`;
  marginValue.textContent = marginInput.value;
  logoSizeValue.textContent = `${logoSizeInput.value}%`;
  logoMarginValue.textContent = logoMarginInput.value;
  charCount.textContent = `${dataInput.value.length} ${dataInput.value.length === 1 ? 'carácter' : 'caracteres'}`;
}

function updateStatus(valid = true) {
  if (valid) {
    previewStatus.textContent = 'QR listo';
    previewMessage.textContent = 'Escanea el código para comprobarlo antes de descargar.';
    dataHint.textContent = 'El QR se actualiza automáticamente.';
    dataHint.style.color = '';
  } else {
    previewStatus.textContent = 'Falta contenido';
    previewMessage.textContent = 'Escribe texto o una URL para generar el código.';
    dataHint.textContent = 'Introduce al menos un carácter.';
    dataHint.style.color = '#fca5a5';
  }
}

function updatePreview() {
  const data = dataInput.value.trim();
  updateLabels();

  if (!data) {
    updateStatus(false);
    return;
  }

  updateStatus(true);
  qr.update({
    width: Number(sizeInput.value),
    height: Number(sizeInput.value),
    data,
    margin: Number(marginInput.value),
    qrOptions: { errorCorrectionLevel: errorLevelInput.value },
    dotsOptions: { color: qrColorInput.value, type: dotTypeInput.value },
    cornersSquareOptions: { color: cornerColorInput.value, type: cornerSquareTypeInput.value },
    cornersDotOptions: { color: cornerColorInput.value, type: cornerDotTypeInput.value },
    backgroundOptions: { color: bgColorInput.value },
    image: logoData || '',
    imageOptions: {
      crossOrigin: 'anonymous',
      margin: Number(logoMarginInput.value),
      imageSize: Number(logoSizeInput.value) / 100,
      hideBackgroundDots: true,
    },
  });
}

function applyPreset(preset) {
  const presets = {
    classic: { qr: '#111827', bg: '#ffffff', dots: 'square', corner: '#111827' },
    purple: { qr: '#7c3aed', bg: '#0b0720', dots: 'rounded', corner: '#c4b5fd' },
    invert: { qr: '#ffffff', bg: '#0b1020', dots: 'rounded', corner: '#ffffff' },
    soft: { qr: '#2b3a67', bg: '#f6f9ff', dots: 'rounded', corner: '#2b3a67' },
    neon: { qr: '#00ffd1', bg: '#03021a', dots: 'dots', corner: '#ff00d0' },
  };
  const selected = presets[preset] || presets.classic;
  qrColorInput.value = selected.qr;
  bgColorInput.value = selected.bg;
  dotTypeInput.value = selected.dots;
  cornerColorInput.value = selected.corner;
  updatePreview();
}

function resetState() {
  Object.entries(DEFAULTS).forEach(([key, value]) => {
    const input = $(key);
    if (input) input.value = value;
  });
  presetSelect.value = 'classic';
  logoInput.value = '';
  logoData = '';
  removeLogo.disabled = true;
  updatePreview();
  showToast('Configuración restablecida');
}

async function copyCurrentPng() {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    showToast('Tu navegador no permite copiar imágenes. Descarga el PNG.', 'error');
    return;
  }

  try {
    const blob = await qr.getRawData('png');
    if (!blob) throw new Error('No se pudo crear la imagen.');
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('PNG copiado al portapapeles');
  } catch (error) {
    console.error(error);
    showToast('No se pudo copiar el PNG. Prueba descargarlo.', 'error');
  }
}

function attachListeners() {
  const liveInputs = [
    dataInput, qrColorInput, bgColorInput, sizeInput, marginInput,
    errorLevelInput, dotTypeInput, cornerSquareTypeInput,
    cornerDotTypeInput, cornerColorInput, logoSizeInput, logoMarginInput,
  ];

  liveInputs.forEach((input) => {
    input.addEventListener('input', updatePreview);
    input.addEventListener('change', updatePreview);
  });

  logoInput.addEventListener('change', (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast('El logo debe pesar menos de 2 MB.', 'error');
      logoInput.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      showToast('Selecciona un archivo de imagen válido.', 'error');
      logoInput.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      logoData = reader.result;
      removeLogo.disabled = false;
      updatePreview();
      showToast('Logo agregado');
    };
    reader.onerror = () => showToast('No se pudo leer el logo.', 'error');
    reader.readAsDataURL(file);
  });

  removeLogo.addEventListener('click', () => {
    logoData = '';
    logoInput.value = '';
    removeLogo.disabled = true;
    updatePreview();
    showToast('Logo eliminado');
  });

  downloadPng.addEventListener('click', () => {
    if (!dataInput.value.trim()) return showToast('Escribe algo antes de descargar.', 'error');
    qr.download({ name: 'qr-personalizado', extension: 'png' });
    showToast('PNG preparado para descargar');
  });

  downloadSvg.addEventListener('click', () => {
    if (!dataInput.value.trim()) return showToast('Escribe algo antes de descargar.', 'error');
    qr.download({ name: 'qr-personalizado', extension: 'svg' });
    showToast('SVG preparado para descargar');
  });

  copyPng.addEventListener('click', copyCurrentPng);
  resetButton.addEventListener('click', resetState);
  presetSelect.addEventListener('change', (event) => applyPreset(event.target.value));

  dataInput.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') dataInput.blur();
  });
}

attachListeners();
updatePreview();