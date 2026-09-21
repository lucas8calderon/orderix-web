import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function DeliveryMenuSearch({ value, onChange }) {
  return (
    <div className="delivery-menu-search">
      <SearchIcon className="delivery-menu-search-icon" aria-hidden="true" />
      <input
        type="search"
        className="delivery-menu-search-input"
        placeholder="Buscar no cardápio..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar no cardápio"
      />
      {value ? (
        <button
          type="button"
          className="delivery-menu-search-clear"
          onClick={() => onChange('')}
          aria-label="Limpar busca"
        >
          <ClearIcon fontSize="small" />
        </button>
      ) : null}
    </div>
  );
}
