import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { formatCurrency } from '../../../services/accessControl';

export default function DemoProductSheet({
  product,
  open,
  isMobile,
  qty,
  note,
  extras,
  selections,
  onClose,
  onQty,
  onNote,
  onToggleExtra,
  onSelect,
  onAdd,
}) {
  if (!product) return null;

  const missingMandatory = (product.mandatoryGroups || []).some((group) => !selections[group.id]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      fullScreen={isMobile}
      className="demo-sheet"
      PaperProps={{ className: `demo-sheet__paper${isMobile ? ' is-mobile' : ''}` }}
    >
      <div className="demo-sheet__media">
        <img src={product.image} alt="" loading="lazy" />
      </div>
      <DialogTitle className="demo-sheet__title">{product.name}</DialogTitle>
      <DialogContent className="demo-sheet__content">
        {product.description ? (
          <Typography className="demo-sheet__desc">{product.description}</Typography>
        ) : null}
        <Typography className="demo-sheet__price">{formatCurrency(product.price)}</Typography>

        {(product.mandatoryGroups || []).map((group) => (
          <div key={group.id} className="demo-sheet__group">
            <Typography variant="subtitle2">{group.name}</Typography>
            <RadioGroup
              value={selections[group.id] || ''}
              onChange={(event) => onSelect(group.id, event.target.value)}
            >
              {(group.items || []).map((item) => (
                <FormControlLabel
                  key={item.id}
                  value={item.id}
                  control={<Radio />}
                  label={`${item.name}${item.price ? ` (+${formatCurrency(item.price)})` : ''}`}
                />
              ))}
            </RadioGroup>
          </div>
        ))}

        {(product.extras || []).map((extra) => (
          <FormControlLabel
            key={extra.id}
            control={(
              <Checkbox
                checked={Boolean(extras[extra.id])}
                onChange={() => onToggleExtra(extra.id)}
              />
            )}
            label={`${extra.name}${extra.price ? ` (+${formatCurrency(extra.price)})` : ''}`}
          />
        ))}

        <TextField
          fullWidth
          label="Observações"
          value={note}
          onChange={(event) => onNote(event.target.value)}
          sx={{ mt: 2 }}
        />
        <div className="demo-qty">
          <IconButton onClick={() => onQty(Math.max(1, qty - 1))} aria-label="Diminuir quantidade">
            <RemoveIcon />
          </IconButton>
          <span>{qty}</span>
          <IconButton onClick={() => onQty(Math.min(20, qty + 1))} aria-label="Aumentar quantidade">
            <AddIcon />
          </IconButton>
        </div>
      </DialogContent>
      <DialogActions className="demo-sheet__actions">
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" disabled={missingMandatory} onClick={onAdd}>
          Adicionar ao carrinho
        </Button>
      </DialogActions>
    </Dialog>
  );
}
