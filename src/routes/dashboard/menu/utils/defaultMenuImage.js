import defaultMenuImageAsset from '../../../../assets/images/sem-imagem.jpg';

export const DEFAULT_MENU_IMAGE_PATH = '/images/sem-imagem.jpg';
export const defaultMenuImage = defaultMenuImageAsset;

export function isBlankImage(image) {
  return !image || !String(image).trim();
}

export function isUserProvidedImage(image) {
  const value = typeof image === 'string' ? image.trim() : '';
  return Boolean(value) && value !== DEFAULT_MENU_IMAGE_PATH;
}

export function imageForSave(image) {
  return isBlankImage(image) ? DEFAULT_MENU_IMAGE_PATH : image;
}

export function resolveMenuImage(image) {
  if (isBlankImage(image) || image === DEFAULT_MENU_IMAGE_PATH) {
    return defaultMenuImageAsset;
  }
  return image;
}
