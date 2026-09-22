import SearchIcon from '@mui/icons-material/Search';

export default function DemoMenuSearch({ value, onChange }) {
  return (
    <label className="demo-search">
      <SearchIcon fontSize="small" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar no cardápio"
        aria-label="Buscar no cardápio"
      />
    </label>
  );
}
