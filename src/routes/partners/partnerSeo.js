import { PARTNER_PAGE_SEO } from './partnerProgram';

function setMeta(attribute, key, content) {
  let node = document.head.querySelector(`meta[${attribute}="${key}"]`);
  const created = !node;
  if (!node) {
    node = document.createElement('meta');
    node.setAttribute(attribute, key);
    document.head.appendChild(node);
  }
  const previous = node.getAttribute('content');
  node.setAttribute('content', content);
  return () => {
    if (created) {
      node.remove();
      return;
    }
    if (previous == null) node.removeAttribute('content');
    else node.setAttribute('content', previous);
  };
}

function setCanonical(href) {
  let node = document.head.querySelector('link[rel="canonical"]');
  const created = !node;
  if (!node) {
    node = document.createElement('link');
    node.setAttribute('rel', 'canonical');
    document.head.appendChild(node);
  }
  const previous = node.getAttribute('href');
  node.setAttribute('href', href);
  return () => {
    if (created) {
      node.remove();
      return;
    }
    if (previous == null) node.removeAttribute('href');
    else node.setAttribute('href', previous);
  };
}

/** Título, descrição, og:* e canonical de uma página institucional. Devolve a função que restaura os anteriores. */
export function applyDocumentMeta({ title, description, canonical }) {
  if (typeof document === 'undefined') return () => {};
  const previousTitle = document.title;
  document.title = title;
  const restores = [
    () => {
      document.title = previousTitle;
    },
    setMeta('name', 'description', description),
    setMeta('property', 'og:title', title),
    setMeta('property', 'og:description', description),
    setMeta('property', 'og:url', canonical),
    setCanonical(canonical),
  ];
  return () => {
    restores.reverse().forEach((restore) => restore());
  };
}

export function applyPartnerDocumentMeta() {
  return applyDocumentMeta(PARTNER_PAGE_SEO);
}
