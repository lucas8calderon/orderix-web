const DEFAULT_TITLE = 'Weper';
const DEFAULT_DESCRIPTION = 'Weper: gestão inteligente para negócios que atendem, vendem e querem crescer. Do pedido ao resultado, no mobile, tablet e desktop.';

export function setDemoDocumentMeta({ title, description } = {}) {
  if (typeof document === 'undefined') return;
  if (title) document.title = title;
  if (description) {
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', description);
  }
}

export function restoreDemoDocumentMeta() {
  setDemoDocumentMeta({
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  });
}
