import React, { useEffect, useState, forwardRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  InputAdornment,
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
import { fileToCompressedDataUrl } from '../utils/compressImage';
import { isUserProvidedImage } from '../utils/defaultMenuImage';
import { buildCategoryTree } from '../utils/categoryTree';

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

function formatPriceInput(value) {
  if (value === '' || value == null || Number.isNaN(Number(value))) return '';
  return Number(value).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function parsePriceInput(raw) {
  const digits = String(raw ?? '').replace(/\D/g, '').slice(0, 8);
  if (!digits) return '';
  return Number(digits) / 100;
}

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
  const [imageError, setImageError] = useState('');
  const dialogProps = useDialogResponsiveProps({
    paperSx: { borderRadius: { xs: 0, sm: '16px' } },
  });

  const isEdit = Boolean(product?.id);

  const availableCategories = categories.filter((cat) => {
    if (cat?.id == null || cat.categoryId != null) return false;
    return (
      cat.active !== false ||
      String(cat.id) === String(form.categoryId || product?.categoryId)
    );
  });
  const categoryTree = buildCategoryTree(availableCategories);
  const selectableIds = new Set();
  categoryTree.forEach((root) => {
    selectableIds.add(String(root.id));
    (root.children || []).forEach((child) => selectableIds.add(String(child.id)));
  });
  const selectedCategoryId =
    form.categoryId != null && form.categoryId !== ''
      ? String(form.categoryId)
      : '';
  const selectedCategoryLabel = (() => {
    for (const root of categoryTree) {
      if (String(root.id) === selectedCategoryId) return root.name;
      const child = (root.children || []).find((item) => String(item.id) === selectedCategoryId);
      if (child) return `${root.name} › ${child.name}`;
    }
    return '';
  })();

  useEffect(() => {
    if (!open) return;

    setImageError('');
    if (product?.id) {
      setForm({
        id: product.id,
        name: product.name || '',
        observation: product.observation || product.description || '',
        value: product.value != null && !Number.isNaN(Number(product.value))
          ? Number(product.value)
          : '',
        categoryId: product.categoryId != null ? String(product.categoryId) : '',
        isAvailable: product.isAvailable !== false,
        image: product.image || '',
      });
      setImagePreview(isUserProvidedImage(product.image) ? product.image : '');
    } else {
      setForm({
        ...emptyForm,
        categoryId: product?.categoryId != null ? String(product.categoryId) : '',
      });
      setImagePreview('');
    }
  }, [open, product]);

  const handleClose = () => {
    setForm(emptyForm);
    setImagePreview('');
    setImageError('');
    onClose();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setImageError('');
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setImagePreview(dataUrl);
      setForm((prev) => ({ ...prev, image: dataUrl }));
    } catch (err) {
      setImageError(err?.message || 'Não foi possível processar a imagem.');
    }
  };

  const numericValue = form.value === '' ? NaN : Number(form.value);
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
      aria-labelledby="product-dialog-title"
      open={open}
      TransitionComponent={Transition}
      keepMounted={false}
      onClose={handleClose}
      maxWidth="sm"
      {...dialogProps}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 4 }, overflowY: 'auto' }}>
        <Typography id="product-dialog-title" component="h2" variant="h5" sx={{ mb: 3, fontWeight: 600, color: 'var(--color-text-primary)' }}>
          {isEdit ? 'Editar produto' : 'Novo produto'}
        </Typography>

        {errorMessage || imageError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {errorMessage || imageError}
          </Alert>
        ) : null}

        {availableCategories.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: '12px' }}>
            Cadastre ao menos uma categoria ativa antes de criar produtos.
          </Alert>
        ) : null}

<Typography component="h3" variant="subtitle2" sx={{ mb: 2 }}>Informações do produto</Typography>
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

<Typography component="h3" variant="subtitle2" sx={{ mt: 1, mb: 2 }}>Preço e categoria</Typography>
        <TextField
          fullWidth
          label="Preço"
          placeholder="0,00"
          value={formatPriceInput(form.value)}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, value: parsePriceInput(e.target.value) }))
          }
          inputMode="numeric"
          autoComplete="off"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">R$</InputAdornment>
            ),
          }}
          inputProps={{
            inputMode: 'numeric',
            'aria-label': 'Preço em reais',
          }}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }} required>
          <InputLabel id="product-category-label" shrink>
            Categoria
          </InputLabel>
          <Select
            labelId="product-category-label"
            label="Categoria"
            notched
            displayEmpty
            value={selectableIds.has(selectedCategoryId) ? selectedCategoryId : ''}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, categoryId: String(e.target.value) }))
            }
            disabled={selectableIds.size === 0}
            renderValue={(value) =>
              value && selectedCategoryLabel ? selectedCategoryLabel : 'Selecione uma categoria'
            }
            MenuProps={{
              container: typeof document !== 'undefined' ? document.body : undefined,
              PaperProps: { sx: { maxHeight: 360 } },
              sx: { zIndex: 2000 },
            }}
          >
            {categoryTree.flatMap((root) => {
              const items = [
                <MenuItem key={root.id} value={String(root.id)}>
                  {root.name}
                  {root.active === false ? ' (inativa)' : ''}
                </MenuItem>,
              ];
              (root.children || []).forEach((child) => {
                items.push(
                  <MenuItem key={child.id} value={String(child.id)} sx={{ pl: 4 }}>
                    {child.name}
                    {child.active === false ? ' (inativa)' : ''}
                  </MenuItem>
                );
              });
              return items;
            })}
          </Select>
          <FormHelperText>
            Escolha onde o produto aparece no seu catálogo.
          </FormHelperText>
        </FormControl>

<Typography component="h3" variant="subtitle2" sx={{ mt: 1, mb: 1 }}>Disponibilidade e imagem</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={form.isAvailable}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, isAvailable: e.target.checked }))
              }
              color="primary"
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
            sx={{ borderColor: 'var(--color-info)', color: 'var(--color-info)' }}
          >
            Escolher imagem
            <VisuallyHiddenInput
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
          </Button>
          <TextField
            fullWidth
            size="small"
            label="Ou cole o link da imagem"
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
            alt="Prévia da imagem do produto"
            sx={{
              width: 150,
              height: 100,
              objectFit: 'cover',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
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
