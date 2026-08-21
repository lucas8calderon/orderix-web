import React, { useEffect, useState, forwardRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogContent,
  FormControlLabel,
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
  image: '',
  active: true,
};

export function CategoryFormDialog({
  open,
  onClose,
  onSave,
  category,
  saving = false,
  errorMessage = '',
}) {
  const [form, setForm] = useState(emptyForm);
  const [imagePreview, setImagePreview] = useState('');
  const dialogProps = useDialogResponsiveProps({
    paperSx: { borderRadius: { xs: 0, sm: '16px' } },
  });

  const isEdit = Boolean(category?.id);

  useEffect(() => {
    if (!open) return;
    if (category?.id) {
      setForm({
        id: category.id,
        name: category.name || '',
        image: category.image || '',
        active: category.active !== false,
      });
      setImagePreview(category.image || '');
    } else {
      setForm(emptyForm);
      setImagePreview('');
    }
  }, [open, category]);

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
          {isEdit ? 'Editar categoria' : 'Nova categoria'}
        </Typography>

        {errorMessage ? (
          <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
            {errorMessage}
          </Alert>
        ) : null}

        <TextField
          autoFocus
          fullWidth
          label="Nome da categoria"
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
              color="secondary"
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
            onClick={() => onSave(form)}
            sx={{ backgroundColor: 'var(--color-primary)', '&:hover': { backgroundColor: 'var(--color-primary-dark)' } }}
          >
            {saving ? 'Salvando...' : 'Salvar categoria'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
