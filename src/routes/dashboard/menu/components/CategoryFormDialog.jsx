import React, { useEffect, useState, forwardRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { fileToCompressedDataUrl } from '../utils/compressImage';
import { isUserProvidedImage } from '../utils/defaultMenuImage';

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
  image: '',
  active: true,
  parentId: '',
};

export function CategoryFormDialog({
  open,
  onClose,
  onSave,
  onDelete,
  category,
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

  const isEdit = Boolean(category?.id);
  const parentCategory = categories.find(
    (item) => String(item.id) === String(form.parentId || category?.parentId)
  );
  const isSubcategory = Boolean(form.parentId);
  const hasChildren = categories.some(
    (item) => String(item.parentId) === String(form.id)
  );
  const parentOptions = categories.filter(
    (item) => item.parentId == null && String(item.id) !== String(form.id)
  );

  useEffect(() => {
    if (!open) return;
    setImageError('');
    if (category?.id) {
      setForm({
        id: category.id,
        name: category.name || '',
        image: category.image || '',
        active: category.active !== false,
        parentId: category.parentId != null ? String(category.parentId) : '',
      });
      setImagePreview(isUserProvidedImage(category.image) ? category.image : '');
    } else {
      setForm({
        ...emptyForm,
        parentId: category?.parentId != null ? String(category.parentId) : '',
      });
      setImagePreview('');
    }
  }, [open, category]);

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

  const canSave = form.name.trim().length > 0 && !saving;

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
          {isEdit
            ? isSubcategory
              ? 'Editar subcategoria'
              : 'Editar categoria'
            : isSubcategory
              ? 'Nova subcategoria'
              : 'Nova categoria'}
        </Typography>

        {errorMessage || imageError ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {errorMessage || imageError}
          </Alert>
        ) : null}

        {!isEdit && parentCategory ? (
          <Chip
            size="small"
            label={`Dentro de ${parentCategory.name}`}
            sx={{
              mb: 2,
              fontWeight: 600,
              backgroundColor: 'var(--color-primary)',
              color: '#fff',
            }}
          />
        ) : null}

        {isEdit && !hasChildren ? (
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="parent-category-label">Exibir dentro de</InputLabel>
            <Select
              labelId="parent-category-label"
              label="Exibir dentro de"
              value={form.parentId}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, parentId: e.target.value }))
              }
            >
              <MenuItem value="">Categoria principal</MenuItem>
              {parentOptions.map((item) => (
                <MenuItem key={item.id} value={String(item.id)}>
                  {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}

        <TextField
          autoFocus
          fullWidth
          label={isSubcategory ? 'Nome da subcategoria' : 'Nome da categoria'}
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={form.active}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, active: e.target.checked }))
              }
              color="primary"
            />
          }
          label={form.active ? 'Ativa' : 'Inativa'}
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
            justifyContent: isEdit && onDelete ? 'space-between' : 'flex-end',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
            '& > button, & > div > button': { minHeight: 44 },
          }}
        >
          {isEdit && onDelete ? (
            <Button
              color="error"
              variant="outlined"
              onClick={onDelete}
              sx={{ flex: { xs: '1 1 140px', sm: '0 0 auto' } }}
            >
              Excluir
            </Button>
          ) : null}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              ml: 'auto',
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
              onClick={() => onSave(form)}
              sx={{ backgroundColor: 'var(--color-primary)', '&:hover': { backgroundColor: 'var(--color-primary-dark)' } }}
            >
              {saving ? 'Salvando...' : isSubcategory ? 'Salvar subcategoria' : 'Salvar categoria'}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
