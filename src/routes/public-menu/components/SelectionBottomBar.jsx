export default function SelectionBottomBar({ itemCount, onOpen }) {
  if (!itemCount) return null;

  const label = itemCount === 1
    ? '1 item selecionado'
    : `${itemCount} itens selecionados`;

  return (
    <div className="public-menu-selection-bar-wrap">
      <button
        type="button"
        className="public-menu-selection-bar"
        onClick={onOpen}
        aria-label={`${label}. Ver seleção`}
      >
        <span className="public-menu-selection-bar-left">
          <span className="public-menu-selection-bar-check" aria-hidden="true">✓</span>
          <span>{label}</span>
        </span>
        <span className="public-menu-selection-bar-action">Ver</span>
      </button>
    </div>
  );
}
