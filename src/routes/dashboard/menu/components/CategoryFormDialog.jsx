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
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogContent sx={{ padding: '32px' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
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

        <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
          <Button
            component="label"
            variant="outlined"
            startIcon={<CloudUploadIcon />}
            sx={{ borderColor: '#7b2cbf', color: '#7b2cbf' }}
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button onClick={handleClose} variant="outlined">
            Cancelar
          </Button>
          <Button
            disabled={!canSave}
            variant="contained"
            onClick={() => onSave(form)}
            sx={{ backgroundColor: '#7b2cbf', '&:hover': { backgroundColor: '#6a1b9a' } }}
          >
            {saving ? 'Salvando...' : 'Salvar categoria'}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
