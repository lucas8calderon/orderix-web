import React, { useEffect, useRef, useState } from 'react';
import { Box, CircularProgress, InputAdornment, TextField } from '@mui/material';
import { cepDigits, formatCepInput } from '../../../../utils/cepInput';
import { CEP_NOT_FOUND, lookupCep } from '../../../../services/viaCepService';
import { storeAddressFromParts } from '../utils/composeStoreAddress';

/**
 * CEP do endereço de origem da loja. Reusa o lookup já usado no checkout.
 * O texto salvo continua sendo storeAddress. Não grava coordenada.
 */
export function StoreOriginAddressFields({ storeAddress, onStoreAddressChange }) {
  const [postalCode, setPostalCode] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [cepLookup, setCepLookup] = useState({ status: 'idle', message: '' });
  const lastLookedUpCep = useRef('');
  const onChangeRef = useRef(onStoreAddressChange);
  const addressRef = useRef(storeAddress ?? '');
  onChangeRef.current = onStoreAddressChange;
  addressRef.current = storeAddress ?? '';

  useEffect(() => {
    const composed = storeAddressFromParts({ street, number, neighborhood, city, state });
    if (!composed || composed === addressRef.current) return;
    onChangeRef.current(composed);
  }, [street, number, neighborhood, city, state]);

  useEffect(() => {
    const cep = cepDigits(postalCode);
    if (cep.length !== 8) {
      lastLookedUpCep.current = '';
      setCepLookup((current) => (
        current.status === 'idle' && !current.message ? current : { status: 'idle', message: '' }
      ));
      return undefined;
    }
    if (lastLookedUpCep.current === cep) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setCepLookup({ status: 'loading', message: 'Consultando CEP...' });
      lookupCep(cep, { signal: controller.signal })
        .then((found) => {
          if (controller.signal.aborted) return;
          lastLookedUpCep.current = cep;
          if (found.street) setStreet((current) => found.street || current);
          if (found.neighborhood) setNeighborhood((current) => found.neighborhood || current);
          if (found.city) setCity((current) => found.city || current);
          if (found.state) setState((current) => found.state || current);
          setCepLookup({
            status: 'ok',
            message: found.street
              ? 'Endereço encontrado. Confira o número.'
              : 'CEP encontrado. Informe rua e número.',
          });
        })
        .catch((err) => {
          if (err?.name === 'AbortError' || controller.signal.aborted) return;
          lastLookedUpCep.current = '';
          setCepLookup({
            status: 'error',
            message: err?.code === CEP_NOT_FOUND
              ? 'CEP não encontrado.'
              : 'Não foi possível consultar o CEP.',
          });
        });
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [postalCode]);

  const helperText = cepLookup.message || 'Digite o CEP para preencher rua, bairro, cidade e UF.';

  return (
    <Box className="setting-item">
      <TextField
        label="CEP"
        value={postalCode}
        onChange={(event) => setPostalCode(formatCepInput(event.target.value))}
        fullWidth
        placeholder="00000-000"
        error={cepLookup.status === 'error'}
        helperText={helperText}
        FormHelperTextProps={{ role: cepLookup.status === 'error' ? 'alert' : 'status' }}
        autoComplete="postal-code"
        inputProps={{
          inputMode: 'numeric',
          maxLength: 9,
          'aria-label': 'CEP do endereço de origem',
        }}
        InputProps={{
          endAdornment: cepLookup.status === 'loading' ? (
            <InputAdornment position="end">
              <CircularProgress size={18} aria-label="Consultando CEP" />
            </InputAdornment>
          ) : null,
        }}
      />
      <Box className="radius-origin-grid">
        <TextField
          label="Rua"
          value={street}
          onChange={(event) => setStreet(event.target.value)}
          fullWidth
          autoComplete="address-line1"
          inputProps={{ 'aria-label': 'Rua do endereço de origem' }}
        />
        <TextField
          label="Número"
          value={number}
          onChange={(event) => setNumber(event.target.value)}
          fullWidth
          helperText="Confira o número."
          autoComplete="off"
          inputProps={{ 'aria-label': 'Número do endereço de origem' }}
        />
      </Box>
      <Box className="radius-origin-grid radius-origin-grid--place">
        <TextField
          label="Bairro"
          value={neighborhood}
          onChange={(event) => setNeighborhood(event.target.value)}
          fullWidth
          inputProps={{ 'aria-label': 'Bairro do endereço de origem' }}
        />
        <TextField
          label="Cidade"
          value={city}
          onChange={(event) => setCity(event.target.value)}
          fullWidth
          autoComplete="address-level2"
          inputProps={{ 'aria-label': 'Cidade do endereço de origem' }}
        />
        <TextField
          label="UF"
          value={state}
          onChange={(event) => setState(event.target.value.toUpperCase().slice(0, 2))}
          fullWidth
          autoComplete="address-level1"
          inputProps={{ maxLength: 2, 'aria-label': 'UF do endereço de origem' }}
        />
      </Box>
      <TextField
        label="Endereço de origem"
        value={storeAddress ?? ''}
        onChange={(event) => onStoreAddressChange(event.target.value)}
        fullWidth
        multiline
        minRows={2}
        placeholder="Rua, número, bairro, cidade"
        helperText="Este texto é o endereço da loja. A coordenada não é gravada aqui."
        inputProps={{ 'aria-label': 'Endereço de origem da entrega' }}
      />
    </Box>
  );
}
