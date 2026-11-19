import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';

export const PDV_CATEGORY_LAYOUT_KEY = 'weper.pdv.categoryLayout';
export const CATEGORY_LAYOUT_CARDS = 'cards';
export const CATEGORY_LAYOUT_CHIPS = 'chips';

export function readPdvCategoryLayout(storage = sessionStorage) {
  try {
    return storage.getItem(PDV_CATEGORY_LAYOUT_KEY) === CATEGORY_LAYOUT_CHIPS
      ? CATEGORY_LAYOUT_CHIPS
      : CATEGORY_LAYOUT_CARDS;
  } catch {
    return CATEGORY_LAYOUT_CARDS;
  }
}

export function writePdvCategoryLayout(layout, storage = sessionStorage) {
  try {
    storage.setItem(
      PDV_CATEGORY_LAYOUT_KEY,
      layout === CATEGORY_LAYOUT_CHIPS ? CATEGORY_LAYOUT_CHIPS : CATEGORY_LAYOUT_CARDS,
    );
  } catch {
    // sessionStorage indisponível: a escolha vale só nesta montagem.
  }
}

export function CategoryViewSwitch({ value, onChange }) {
  return (
    <Box
      sx={{
        flex: '0 0 auto',
        display: 'inline-flex',
        p: 0.25,
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
      }}
    >
      <ToggleButtonGroup
        className="pdv-category-layout"
        exclusive
        size="small"
        value={value}
        onChange={(_, next) => {
          if (next) onChange(next);
        }}
        aria-label="Visualização das categorias"
      >
        <ToggleButton value={CATEGORY_LAYOUT_CARDS}>
          <GridViewIcon sx={{ fontSize: 18 }} />
          Cards
        </ToggleButton>
        <ToggleButton value={CATEGORY_LAYOUT_CHIPS}>
          <ViewListIcon sx={{ fontSize: 18 }} />
          Chips PDV
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
