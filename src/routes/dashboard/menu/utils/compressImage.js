const DEFAULT_OPTIONS = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 0.75,
  maxFileBytes: 8 * 1024 * 1024,
};

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    image.src = dataUrl;
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

export async function fileToCompressedDataUrl(file, options = {}) {
  const { maxWidth, maxHeight, quality, maxFileBytes } = { ...DEFAULT_OPTIONS, ...options };

  if (!file) {
    throw new Error('Selecione uma imagem.');
  }
  if (!file.type?.startsWith('image/')) {
    throw new Error('O arquivo precisa ser uma imagem.');
  }
  if (file.size > maxFileBytes) {
    throw new Error('A imagem é grande demais. Escolha um arquivo de até 8 MB.');
  }

  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);
  const scale = Math.min(1, maxWidth / image.width, maxHeight / image.height);
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    return originalDataUrl;
  }
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', quality);
}
