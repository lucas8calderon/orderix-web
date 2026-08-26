import React, { useState, useEffect, useContext, forwardRef } from 'react';
import {
  Button, Dialog, DialogContent,
  Slide, Typography, TextField, Avatar, Alert, Box
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { CategoryContext } from '../category/providers/CategoryContext';
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

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export function CategoryProductFormDialog({ open, onClose, onSaveCategory, onSaveProduct }) {
  const { onAddCategoryResult, setBlockCategoriesFields } = useContext(CategoryContext);

  const [category, setCategory] = useState({ name: "", backgroundColor: "", image: "" });
    const [imageUpload, setImageUpload] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [showAlert, setShowAlert] = useState(false);
    const dialogProps = useDialogResponsiveProps({
      paperSx: {
        borderRadius: { xs: 0, sm: '16px' },
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
      },
    });

  const handleCategorySave = () => onSaveCategory(category);

  const handleOnClose = () => {
    setCategory({ name: "", backgroundColor: "", image: "" });
    setImageUpload("");
    setImagePreview("");
    setShowAlert(false);
    onClose();
  };

  useEffect(() => {
    if (open) {
      setBlockCategoriesFields(false);
      setCategory({ name: "", backgroundColor: "", image: "" });
      setImageUpload("");
      setImagePreview("");
      setShowAlert(false);
    }
  }, [open, setBlockCategoriesFields]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // Base64 para preview
      setImageUpload(reader.result);  // para envio à API (se aceitasse)
      setCategory({ ...category, image: reader.result });
      
    };
    reader.readAsDataURL(file);
  };

  const handleImageUrl = (url) => {
    setImagePreview(url);
    setImageUpload(url); // se a API aceita URL
    setCategory({ ...category, image: url });
  };

  useEffect(() => {
    if (Object.keys(onAddCategoryResult).length) {
      setShowAlert(true);
      const timeout = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [onAddCategoryResult]);

  useEffect(() => {
  if (onAddCategoryResult?.severity === "success") {
    setCategory({ name: "", backgroundColor: "", image: "" });
    setImageUpload("");
    setImagePreview("");
  }
}, [onAddCategoryResult]);

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleOnClose}
      maxWidth="md"
      {...dialogProps}
    >
      <DialogContent sx={{ p: { xs: 2, sm: 4 }, overflowY: 'auto' }}>
        {/* Categoria */}
        <Box>
          <Typography variant="h5" sx={{ 
            mb: 3, 
            fontWeight: 600, 
            color: 'var(--color-text-primary)'
          }}>
            Nova Categoria
          </Typography>

          {showAlert && onAddCategoryResult?.message && (
            <Alert
              sx={{
                mb: 3,
                borderRadius: '12px',
                '& .MuiAlert-message': {
                  fontWeight: 500
                }
              }}
              severity={onAddCategoryResult.severity}
            >
              {onAddCategoryResult.message}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
            <Avatar 
              sx={{ 
                bgcolor: 'var(--color-primary)', 
                width: 48, 
                height: 48,
                fontSize: '1.2rem',
                fontWeight: 600
              }} 
              variant="square"
            >
              {category.name.charAt(0).toUpperCase() || 'N'}
            </Avatar>
            
            <Box sx={{ flex: 1 }}>
              <TextField
                autoFocus
                fullWidth
                label="Nome da categoria"
                variant="outlined"
                value={category.name}
                onChange={(e) => setCategory({ ...category, name: e.target.value })}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'var(--color-primary)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--color-primary)',
                  }
                }}
              />
              
              {/* Upload ou URL */}
              <Box sx={{ display: 'flex', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    borderRadius: '8px',
                    borderColor: 'var(--color-primary)',
                    color: 'var(--color-primary)',
                    '&:hover': {
                      borderColor: 'var(--color-primary-dark)',
                      backgroundColor: 'rgba(37, 99, 235, 0.04)',
                    }
                  }}
                >
                  Upload
                  <VisuallyHiddenInput
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
                <TextField
                  label="Ou URL da imagem"
                  variant="outlined"
                  size="small"
                  value={imageUpload.startsWith('http') ? imageUpload : ''}
                  onChange={(e) => handleImageUrl(e.target.value)}
                  sx={{ 
                    flexGrow: 1,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'var(--color-primary)',
                    },
                    '& .MuiInputLabel-root.Mui-focused': {
                      color: 'var(--color-primary)',
                    }
                  }}
                />
              </Box>

              {/* Preview */}
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                    Preview da imagem:
                  </Typography>
                  <Box
                    component="img"
                    src={imagePreview}
                    alt="Preview"
                    sx={{
                      width: 150,
                      height: 100,
                      objectFit: 'cover',
                      borderRadius: '8px',
                      border: '2px solid #e0e0e0'
                    }}
                  />
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, flexWrap: 'wrap', '& > button': { flex: { xs: '1 1 140px', sm: '0 0 auto' }, minHeight: 44 } }}>
            <Button 
              onClick={handleOnClose}
              variant="outlined"
              sx={{
                borderRadius: '8px',
                borderColor: '#e0e0e0',
                color: 'var(--color-text-secondary)',
                '&:hover': {
                  borderColor: '#ccc',
                  backgroundColor: '#f5f5f5',
                }
              }}
            >
              Cancelar
            </Button>
            <Button 
              disabled={!category.name?.trim()} 
              onClick={handleCategorySave} 
              variant="contained"
              sx={{
                borderRadius: '8px',
                backgroundColor: 'var(--color-primary)',
                '&:hover': {
                  backgroundColor: 'var(--color-primary-dark)',
                },
                '&:disabled': {
                  backgroundColor: '#e0e0e0',
                  color: '#999',
                }
              }}
            >
              Salvar categoria
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}