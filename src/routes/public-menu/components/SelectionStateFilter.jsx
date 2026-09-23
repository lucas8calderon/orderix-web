export default function SelectionStateFilter({
  mode,
  selectedCount,
  onChange,
}) {
  return (
    <div
      className="public-menu-state-filter"
      role="group"
      aria-label="Filtro da seleção"
    >
      <button
        type="button"
        className={`public-menu-state-chip${mode === 'all' ? ' is-active' : ''}`}
        aria-pressed={mode === 'all'}
        onClick={() => onChange('all')}
      >
        Todos
      </button>
      <button
        type="button"
        className={`public-menu-state-chip${mode === 'selected' ? ' is-active' : ''}`}
        aria-pressed={mode === 'selected'}
        onClick={() => onChange('selected')}
      >
        <span aria-hidden="true">✓</span>
        {' '}
        Selecionados
        {selectedCount > 0 ? ` (${selectedCount})` : ''}
      </button>
    </div>
  );
}
