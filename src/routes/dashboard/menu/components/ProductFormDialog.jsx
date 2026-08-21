import React, { useEffect, useState, forwardRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Slide,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { useDialogResponsiveProps } from '../../../../commons/hooks/useResponsive';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  width: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
});

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

const emptyForm = {
  id: null,
  name: '',
  observation: '',
  value: '',
  categoryId: '',
  isAvailable: true,
  image: '',
};

export function ProductFormDialog({
  open,
  onClose,
  onSave,
  product,
  categories = [],
  saving = false,
  errorMessage = '',
}) {
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState('');
  const dialogProps = useDialogResponsiveProps({
    paperSx: { borderRadius: { xs: 0, sm: '16px' } },
  });

  const isEdit = Boolean(product?.id);

  const availableCategories = categories.filter(
    (cat) =>
      cat.active !== false ||
      String(cat.id) === String(form.categoryId || product?.categoryId)
  );

  useEffect(() => {
    if (!open) return;

    const defaultCategoryId =
      product?.categoryId != null
        ? String(product.categoryId)
        : availableCategories[0]?.id != null
          ? String(availableCategories[0].id)
          : '';

    if (product?.id) {
      setForm({
        id: product.id,
        name: product.name || '',
        observation: product.observation || product.description || '',
        value: product.value != null ? String(product.value) : '',
        categoryId: product.categoryId != null ? String(product.categoryId) : defaultCategoryId,
        isAvailable: product.isAvailable !== false,
        image: product.image || '',
      });
      setImagePreview(product.image || '');
    } else {
      setForm({
        ...emptyForm,
        categoryId: defaultCategoryId,
      });
      setImagePreview('');
    }
  }, [open, product]);

  const handleClose = () => {
    setForm(emptyForm);
    setImagePreview('');
    onClose();
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setForm((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const numericValue = Number(String(form.value).replace(',', '.'));
  const hasCategory = form.categoryId !== '' && form.categoryId != null;
  const canSave =
    form.name.trim().length > 0 &&
    hasCategory &&
    !Number.isNaN(numericValue) &&
    numericValue > 0 &&
    !saving;

  const handleSave = () => {
    onSave({
      ...form,
      categoryId: Number(form.categoryId),
      value: numericValue,
    });
  };

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      maxWidth="sm"
      {...dialogProps}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 4 }, overflowY: 'auto' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {isEdit ? 'Editar produto' : 'Novo produto'}
        </Typography>

        {errorMessage ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {errorMessage}
          </Alert>
        ) : null}

        {availableCategories.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
            Cadastre ao menos uma categoria ativa antes de criar produtos.
          </Alert>
        ) : null}

        <TextField
          autoFocus
          fullWidth
          label="Nome do produto"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Descrição"
          multiline
          minRows={2}
          value={form.observation}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, observation: e.target.value }))
          }
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Preço"
          type="number"
          inputProps={{ min: 0, step: '0.01' }}
          value={form.value}
          onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }} required>
          <InputLabel id="product-category-label">Categoria</InputLabel>
          <Select
            labelId="product-category-label"
            label="Categoria"
            value={form.categoryId || ''}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            disabled={availableCategories.length === 0}
          >
            {availableCategories.map((cat) => (
              <MenuItem key={cat.id} value={String(cat.id)}>
                {cat.name}
                {cat.active === false ? ' (inativa)' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControlLabel
          control={
            <Switch
              checked={form.isAvailable}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))
              }
              color="secondary"
            />
          }
          label={form.isAvailable ? 'Ativo' : 'Inativo'}
          sx={{ mb: 2 }}
        />

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            alignItems: { xs: 'stretch', sm: 'center' },
            flexDirection: { xs: 'column', sm: 'row' },
          }}
        >
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ borderColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
          >
            Upload
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
          <TextField
            fullWidth
            size="small"
            label="Ou URL da imagem"
            value={form.image?.startsWith?.('http') ? form.image : ''}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, image: e.target.value }));
              setImagePreview(e.target.value);
            }}
          />
        </Box>

        {imagePreview ? (
          <Box
            component="img"
            src={imagePreview}
            alt="Preview"
            sx={{
              width: 150,
              height: 100,
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid #e0e0e0',
              mb: 2,
            }}
          />
        ) : null}

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2,
            flexWrap: 'wrap',
            '& > button': { minHeight: 44, flex: { xs: '1 1 140px', sm: '0 0 auto' } },
          }}
        >
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            disabled={!canSave}
            variant="contained"
            onClick={handleSave}
            sx={{ backgroundColor: 'var(--color-primary)', '&:hover': { backgroundColor: 'var(--color-primary-dark)' } }}
          >
            {saving ? 'Salvando...' : 'Salvar produto'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
