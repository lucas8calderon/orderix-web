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

export function applyPartnerDocumentMeta() {
  if (typeof document === 'undefined') return () => {};
  const previousTitle = document.title;
  document.title = PARTNER_PAGE_SEO.title;
  const restores = [
    () => {
      document.title = previousTitle;
    },
    setMeta('name', 'description', PARTNER_PAGE_SEO.description),
    setMeta('property', 'og:title', PARTNER_PAGE_SEO.title),
    setMeta('property', 'og:description', PARTNER_PAGE_SEO.description),
    setMeta('property', 'og:url', PARTNER_PAGE_SEO.canonical),
    setCanonical(PARTNER_PAGE_SEO.canonical),
  ];
  return () => {
    restores.reverse().forEach((restore) => restore());
  };
}
