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
  variations: [],
  choiceGroups: [],
};

function newVariationKey() {
  return `var-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toVariationRows(variations) {
  return (variations || []).map((variation) => ({
    key: variation.id ? `var-${variation.id}` : newVariationKey(),
    id: variation.id || null,
    name: variation.name || '',
    price: variation.price != null && !Number.isNaN(Number(variation.price))
      ? Number(variation.price)
      : '',
    available: variation.available !== false,
  }));
}

function newChoiceKey() {
  return `choice-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function toChoiceRows(groups) {
  return (groups || []).map((group) => ({
    key: group.id ? `choice-${group.id}` : newChoiceKey(),
    id: group.id || null,
    name: group.name || '',
    description: group.description || '',
    minSelections: group.minSelections ?? 1,
    maxSelections: group.maxSelections ?? 1,
    priceMode: group.priceMode === 'HIGHEST' ? 'HIGHEST' : 'SUM',
    items: (group.items || []).map((item) => ({
      key: item.id ? `item-${item.id}` : newChoiceKey(),
      id: item.id || null,
      name: item.name || '',
      description: item.description || '',
      price: item.price != null && !Number.isNaN(Number(item.price)) ? Number(item.price) : '',
    })),
  }));
}

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
        variations: toVariationRows(product.variations),
        choiceGroups: toChoiceRows(product.mandatoryGroups),
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

  const variationRows = form.variations || [];
  const usingVariations = variationRows.length > 0;
  const variationPrices = variationRows
    .map((row) => (row.price === '' ? NaN : Number(row.price)))
    .filter((price) => !Number.isNaN(price) && price > 0);
  const variationNames = variationRows.map((row) => row.name.trim().toLowerCase()).filter(Boolean);
  const duplicateVariation = variationNames.length !== new Set(variationNames).size;
  const variationsValid = variationRows.every((row) => {
    const price = row.price === '' ? NaN : Number(row.price);
    return row.name.trim().length > 0 && !Number.isNaN(price) && price > 0;
  }) && !duplicateVariation;
  const fromPrice = variationPrices.length ? Math.min(...variationPrices) : '';
  const numericValue = usingVariations
    ? (fromPrice === '' ? NaN : Number(fromPrice))
    : (form.value === '' ? NaN : Number(form.value));
  const choiceGroups = form.choiceGroups || [];
  const choicePrices = choiceGroups
    .filter((group) => group.priceMode === 'HIGHEST')
    .flatMap((group) => group.items || [])
    .map((item) => Number(item.price))
    .filter((price) => Number.isFinite(price) && price > 0);
  const choicesValid = choiceGroups.every((group) => {
    const min = Number(group.minSelections);
    const max = Number(group.maxSelections);
    const items = (group.items || []).filter((item) => item.name.trim());
    return group.name.trim()
      && Number.isFinite(min) && Number.isFinite(max) && min >= 0 && max >= min && max >= 1
      && items.length > 0
      && items.every((item) => {
        const price = Number(item.price);
        return Number.isFinite(price) && (group.priceMode === 'HIGHEST' ? price > 0 : price >= 0);
      });
  });
  const hasCategory = form.categoryId !== '' && form.categoryId != null;
  const priceReady = usingVariations
    ? variationsValid
    : choicePrices.length
      ? true
      : !Number.isNaN(numericValue) && numericValue > 0;
  const canSave = form.name.trim().length > 0 && hasCategory && priceReady && choicesValid && !saving;

  const updateVariation = (key, patch) => {
    setForm((prev) => ({
      ...prev,
      variations: (prev.variations || []).map((row) => (row.key === key ? { ...row, ...patch } : row)),
    }));
  };

  const handleSave = () => {
    onSave({
      ...form,
      categoryId: Number(form.categoryId),
      value: numericValue,
      value: !usingVariations && choicePrices.length ? Math.min(...choicePrices) : numericValue,
      variations: variationRows.map((row, index) => ({
        id: row.id || null,
        name: row.name.trim(),
        price: Number(row.price),
        sortOrder: index,
        available: row.available !== false,
      })),
      mandatoryGroups: choiceGroups.filter((group) => group.name.trim()).map((group) => ({
        id: group.id || null,
        name: group.name.trim(),
        description: group.description.trim(),
        minSelections: Number(group.minSelections),
        maxSelections: Number(group.maxSelections),
        priceMode: group.priceMode,
        items: (group.items || []).filter((item) => item.name.trim()).map((item) => ({
          id: item.id || null,
          name: item.name.trim(),
          description: item.description.trim(),
          price: Number(item.price) || 0,
        })),
      })),
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
          label={usingVariations ? 'A partir de' : 'Preço'}
          placeholder="0,00"
          value={formatPriceInput(usingVariations ? fromPrice : form.value)}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, value: parsePriceInput(e.target.value) }))
          }
          disabled={usingVariations}
          inputMode="numeric"
          autoComplete="off"
          helperText={usingVariations ? 'O menor preço das variações aparece no cardápio.' : 'Use um preço único quando o produto não muda de valor.'}
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

        <Box sx={{ mb: 2 }}>
          <Typography component="h3" variant="subtitle2">Variações de preço</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
            O mesmo produto com valores diferentes. Exemplo: Marmita — Pequena R$ 18,00 e Grande R$ 26,00. O cliente precisa escolher uma variação antes de pedir e paga o preço dela.
          </Typography>
          {variationRows.map((row) => (
            <Box key={row.key} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'flex-start', flexDirection: { xs: 'column', sm: 'row' } }}>
              <TextField
                fullWidth
                label="Variação"
                placeholder="Pequeno"
                value={row.name}
                onChange={(e) => updateVariation(row.key, { name: e.target.value })}
              />
              <TextField
                label="Preço"
                placeholder="0,00"
                value={formatPriceInput(row.price)}
                onChange={(e) => updateVariation(row.key, { price: parsePriceInput(e.target.value) })}
                inputMode="numeric"
                sx={{ width: { xs: '100%', sm: 160 }, flexShrink: 0 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
              <Button
                onClick={() => setForm((prev) => ({
                  ...prev,
                  variations: (prev.variations || []).filter((item) => item.key !== row.key),
                }))}
                sx={{ minHeight: 56, flexShrink: 0 }}
              >
                Remover
              </Button>
            </Box>
          ))}
          {duplicateVariation ? (
            <FormHelperText error sx={{ mb: 1 }}>Cada variação precisa de um nome diferente.</FormHelperText>
          ) : null}
          <Button
            variant="outlined"
            onClick={() => setForm((prev) => ({
              ...prev,
              variations: [...(prev.variations || []), { key: newVariationKey(), id: null, name: '', price: '', available: true }],
            }))}
          >
            Adicionar variação
          </Button>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography component="h3" variant="subtitle2">Escolhas do cliente</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
            Pizza de um sabor: mínimo 1. Pizza de dois sabores: mínimo 2. O cardápio mostra 0/2 e o pedido só segue depois dessa quantidade. Seletor: escolha única obrigatória, como o ponto da carne do hambúrguer (ao ponto, mal passada ou bem passada). O cliente precisa escolher uma opção para o pedido seguir. Preço 0 não muda o valor do produto.
          </Typography>
          {choiceGroups.map((group) => (
            <Box key={group.key} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 1.5, mb: 1.5 }}>
              <TextField
                fullWidth
                label="Nome da escolha"
                placeholder="Sabores"
                value={group.name}
                onChange={(event) => setForm((prev) => ({
                  ...prev,
                  choiceGroups: prev.choiceGroups.map((entry) => (
                    entry.key === group.key ? { ...entry, name: event.target.value } : entry
                  )),
                }))}
                sx={{ mb: 1 }}
              />
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Button
                  size="small"
                  variant={Number(group.minSelections) === 1 && Number(group.maxSelections) === 1 && group.priceMode === 'HIGHEST' ? 'contained' : 'outlined'}
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    choiceGroups: prev.choiceGroups.map((entry) => (
                      entry.key === group.key
                        ? { ...entry, name: entry.name || 'Sabor', minSelections: 1, maxSelections: 1, priceMode: 'HIGHEST' }
                        : entry
                    )),
                  }))}
                >
                  1 sabor
                </Button>
                <Button
                  size="small"
                  variant={Number(group.minSelections) === 2 && Number(group.maxSelections) === 2 && group.priceMode === 'HIGHEST' ? 'contained' : 'outlined'}
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    choiceGroups: prev.choiceGroups.map((entry) => (
                      entry.key === group.key
                        ? { ...entry, name: entry.name || 'Sabores', minSelections: 2, maxSelections: 2, priceMode: 'HIGHEST' }
                        : entry
                    )),
                  }))}
                >
                  2 sabores
                </Button>
                <Button
                  size="small"
                  variant={Number(group.minSelections) === 1 && Number(group.maxSelections) === 1 && group.priceMode === 'SUM' ? 'contained' : 'outlined'}
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    choiceGroups: prev.choiceGroups.map((entry) => (
                      entry.key === group.key
                        ? { ...entry, name: entry.name || 'Ponto da carne', minSelections: 1, maxSelections: 1, priceMode: 'SUM' }
                        : entry
                    )),
                  }))}
                >
                  Seletor
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <TextField
                  label="Mínimo para pedir"
                  type="number"
                  value={group.minSelections}
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    choiceGroups: prev.choiceGroups.map((entry) => (
                      entry.key === group.key ? { ...entry, minSelections: event.target.value } : entry
                    )),
                  }))}
                  inputProps={{ min: 0, max: 20 }}
                  sx={{ width: 110 }}
                />
                <TextField
                  label="Máximo"
                  type="number"
                  value={group.maxSelections}
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    choiceGroups: prev.choiceGroups.map((entry) => (
                      entry.key === group.key ? { ...entry, maxSelections: event.target.value } : entry
                    )),
                  }))}
                  inputProps={{ min: 1, max: 20 }}
                  sx={{ width: 110 }}
                />
                <TextField
                  select
                  label="Preço"
                  value={group.priceMode}
                  onChange={(event) => setForm((prev) => ({
                    ...prev,
                    choiceGroups: prev.choiceGroups.map((entry) => (
                      entry.key === group.key ? { ...entry, priceMode: event.target.value } : entry
                    )),
                  }))}
                  sx={{ minWidth: 180, flex: 1 }}
                >
                  <MenuItem value="HIGHEST">Maior valor</MenuItem>
                  <MenuItem value="SUM">Somar ao preço</MenuItem>
                </TextField>
              </Box>
              <FormHelperText sx={{ mb: 1 }}>
                {Number(group.minSelections) === 1 && Number(group.maxSelections) === 1 && group.priceMode === 'SUM'
                  ? 'O cliente vê 0/1. Hambúrguer, ponto da carne: ao ponto, mal passada ou bem passada. O cliente precisa escolher uma opção para o pedido seguir. Preço 0 não muda o valor do produto.'
                  : `O cliente vê ${0}/${Number(group.minSelections) || 0}. Com mínimo 2, um sabor só não envia o pedido.`}
              </FormHelperText>
              {(group.items || []).map((item) => (
                <Box key={item.key} sx={{ display: 'flex', gap: 1, mb: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <TextField
                    fullWidth
                    label="Opção"
                    placeholder="Calabresa"
                    value={item.name}
                    onChange={(event) => setForm((prev) => ({
                      ...prev,
                      choiceGroups: prev.choiceGroups.map((entry) => (
                        entry.key === group.key
                          ? { ...entry, items: entry.items.map((row) => (row.key === item.key ? { ...row, name: event.target.value } : row)) }
                          : entry
                      )),
                    }))}
                  />
                  <TextField
                    fullWidth
                    label="Descrição"
                    value={item.description}
                    onChange={(event) => setForm((prev) => ({
                      ...prev,
                      choiceGroups: prev.choiceGroups.map((entry) => (
                        entry.key === group.key
                          ? { ...entry, items: entry.items.map((row) => (row.key === item.key ? { ...row, description: event.target.value } : row)) }
                          : entry
                      )),
                    }))}
                  />
                  <TextField
                    label="Preço da opção"
                    value={formatPriceInput(item.price)}
                    onChange={(event) => setForm((prev) => ({
                      ...prev,
                      choiceGroups: prev.choiceGroups.map((entry) => (
                        entry.key === group.key
                          ? { ...entry, items: entry.items.map((row) => (row.key === item.key ? { ...row, price: parsePriceInput(event.target.value) } : row)) }
                          : entry
                      )),
                    }))}
                    sx={{ width: { xs: '100%', sm: 150 } }}
                  />
                </Box>
              ))}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button
                  variant="text"
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    choiceGroups: prev.choiceGroups.map((entry) => (
                      entry.key === group.key
                        ? { ...entry, items: [...entry.items, { key: newChoiceKey(), id: null, name: '', description: '', price: '' }] }
                        : entry
                    )),
                  }))}
                >
                  Adicionar opção
                </Button>
                <Button
                  color="inherit"
                  onClick={() => setForm((prev) => ({
                    ...prev,
                    choiceGroups: prev.choiceGroups.filter((entry) => entry.key !== group.key),
                  }))}
                >
                  Remover escolha
                </Button>
              </Box>
            </Box>
          ))}
          <Button
            variant="outlined"
            onClick={() => setForm((prev) => ({
              ...prev,
              choiceGroups: [...(prev.choiceGroups || []), {
                key: newChoiceKey(),
                id: null,
                name: '',
                description: '',
                minSelections: 1,
                maxSelections: 2,
                priceMode: 'HIGHEST',
                items: [{ key: newChoiceKey(), id: null, name: '', description: '', price: '' }],
              }],
            }))}
          >
            Adicionar escolha
          </Button>
        </Box>

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
