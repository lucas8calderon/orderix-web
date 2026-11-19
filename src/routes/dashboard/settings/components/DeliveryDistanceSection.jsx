import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { formatCurrencyInput, parseCurrencyInput } from '../../../../utils/currencyInput';
import { cepDigits, formatCepInput } from '../../../../utils/cepInput';
import { CEP_NOT_FOUND, lookupCep } from '../../../../services/viaCepService';
import { simulateDeliveryDistance } from '../../../../services/deliveryService';

const STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
];

function moneyField(value) {
  return formatCurrencyInput(value);
}

export function DeliveryDistanceSection({ settings, onSettingChange }) {
  const [simulating, setSimulating] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [cepHint, setCepHint] = useState('');
  const lastDestinationCep = useRef('');
  const [destination, setDestination] = useState({
    postalCode: '',
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: 'SP',
  });

  const setOrigin = (field, value) => onSettingChange(field, null, value);

  const fillCep = async (masked) => {
    setOrigin('originPostalCode', masked);
    if (cepDigits(masked).length !== 8) return;
    try {
      const found = await lookupCep(masked);
      setOrigin('originStreet', found.street || '');
      setOrigin('originNeighborhood', found.neighborhood || '');
      setOrigin('originCity', found.city || '');
      setOrigin('originState', found.state || '');
    } catch {
      // O CEP só adianta o preenchimento. A confirmação continua na Geoapify, ao salvar.
    }
  };

  useEffect(() => {
    const cep = cepDigits(destination.postalCode);
    if (cep.length !== 8) {
      lastDestinationCep.current = '';
      setCepHint('');
      return undefined;
    }
    if (lastDestinationCep.current === cep) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setCepHint('Consultando CEP...');
      lookupCep(cep, { signal: controller.signal })
        .then((found) => {
          if (controller.signal.aborted) return;
          lastDestinationCep.current = cep;
          setDestination((prev) => {
            if (cepDigits(prev.postalCode) !== cep) return prev;
            return {
              ...prev,
              postalCode: found.postalCode || prev.postalCode,
              street: found.street,
              neighborhood: found.neighborhood,
              city: found.city,
              state: found.state || prev.state,
            };
          });
          setCepHint(found.street
            ? 'Endereço encontrado. Confira o número.'
            : 'CEP encontrado. Informe rua e número.');
        })
        .catch((err) => {
          if (err?.name === 'AbortError' || controller.signal.aborted) return;
          lastDestinationCep.current = '';
          setCepHint(err?.code === CEP_NOT_FOUND
            ? 'CEP não encontrado. Confira ou preencha o endereço.'
            : 'Não foi possível consultar o CEP. Preencha o endereço.');
        });
    }, 280);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [destination.postalCode]);

  const simulate = async () => {
    setSimulating(true);
    setSimulation(null);
    try {
      const response = await simulateDeliveryDistance({
        postalCode: cepDigits(destination.postalCode),
        street: destination.street,
        number: destination.number,
        neighborhood: destination.neighborhood,
        city: destination.city,
        state: destination.state,
      });
      setSimulation(response.data);
    } catch (error) {
      setSimulation({
        status: 'UNAVAILABLE',
        message: error?.response?.data?.message || 'Não foi possível simular esta entrega.',
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <Typography variant="subtitle1">Entrega por distância</Typography>
      <Typography variant="body2" color="text.secondary">
        A taxa usa a distância pelas ruas, a partir do endereço de retirada. O endereço comercial da loja não muda.
        {settings?.originValidated ? ' O endereço de retirada está confirmado.' : ' Salve para confirmar o endereço no mapa.'}
      </Typography>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '160px 1fr 120px' } }}>
        <TextField
          label="CEP"
          value={settings?.originPostalCode || ''}
          onChange={(event) => fillCep(formatCepInput(event.target.value))}
        />
        <TextField
          label="Rua"
          value={settings?.originStreet || ''}
          onChange={(event) => setOrigin('originStreet', event.target.value)}
        />
        <TextField
          label="Número"
          value={settings?.originNumber || ''}
          onChange={(event) => setOrigin('originNumber', event.target.value)}
        />
      </Box>
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 120px' } }}>
        <TextField
          label="Complemento"
          value={settings?.originComplement || ''}
          onChange={(event) => setOrigin('originComplement', event.target.value)}
        />
        <TextField
          label="Bairro"
          value={settings?.originNeighborhood || ''}
          onChange={(event) => setOrigin('originNeighborhood', event.target.value)}
        />
        <TextField
          select
          label="UF"
          value={settings?.originState || ''}
          onChange={(event) => setOrigin('originState', event.target.value)}
        >
          {STATES.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
        </TextField>
      </Box>
      <TextField
        label="Cidade"
        value={settings?.originCity || ''}
        onChange={(event) => setOrigin('originCity', event.target.value)}
      />
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr' } }}>
        <TextField
          label="Distância máxima (km)"
          type="number"
          value={settings?.deliveryMaxDistanceKm ?? ''}
          onChange={(event) => setOrigin('deliveryMaxDistanceKm', event.target.value)}
          inputProps={{ min: 0.1, step: 0.1 }}
        />
        <TextField
          label="Preço por km"
          value={moneyField(settings?.deliveryPricePerKm)}
          onChange={(event) => setOrigin('deliveryPricePerKm', parseCurrencyInput(event.target.value))}
        />
        <TextField
          label="Taxa mínima"
          value={moneyField(settings?.deliveryMinimumFee)}
          onChange={(event) => setOrigin('deliveryMinimumFee', parseCurrencyInput(event.target.value))}
          helperText="Opcional"
        />
      </Box>
      <TextField
        select
        label="Arredondamento"
        value={settings?.deliveryRoundingMode || 'PROPORTIONAL'}
        onChange={(event) => setOrigin('deliveryRoundingMode', event.target.value)}
      >
        <MenuItem value="PROPORTIONAL">Proporcional — 4,8 km × R$ 2 = R$ 9,60</MenuItem>
        <MenuItem value="STARTED_KM">Quilômetro iniciado — 4,8 km = 5 km</MenuItem>
      </TextField>

      <Box sx={{ display: 'grid', gap: 1.5 }}>
        <Typography variant="subtitle2">Simular entrega</Typography>
        <Typography variant="body2" color="text.secondary">
          A simulação usa a configuração já salva e o mesmo cálculo do checkout.
        </Typography>
        <TextField
          label="CEP"
          value={destination.postalCode}
          onChange={(event) => setDestination((prev) => ({ ...prev, postalCode: formatCepInput(event.target.value) }))}
          helperText={cepHint || 'Informe o CEP para preencher a rua, o bairro e a cidade.'}
          inputProps={{ inputMode: 'numeric', autoComplete: 'postal-code' }}
        />
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 140px' } }}>
          <TextField
            label="Rua"
            value={destination.street}
            onChange={(event) => setDestination((prev) => ({ ...prev, street: event.target.value }))}
          />
          <TextField
            label="Número"
            value={destination.number}
            onChange={(event) => setDestination((prev) => ({ ...prev, number: event.target.value }))}
          />
        </Box>
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 100px' } }}>
          <TextField
            label="Bairro"
            value={destination.neighborhood}
            onChange={(event) => setDestination((prev) => ({ ...prev, neighborhood: event.target.value }))}
          />
          <TextField
            label="Cidade"
            value={destination.city}
            onChange={(event) => setDestination((prev) => ({ ...prev, city: event.target.value }))}
          />
          <TextField
            select
            label="UF"
            value={destination.state}
            onChange={(event) => setDestination((prev) => ({ ...prev, state: event.target.value }))}
          >
            {STATES.map((state) => <MenuItem key={state} value={state}>{state}</MenuItem>)}
          </TextField>
        </Box>
        <Button variant="outlined" disabled={simulating} onClick={simulate}>
          {simulating ? 'Calculando...' : 'Simular'}
        </Button>
        {simulation ? (
          <Alert severity={simulation.status === 'AVAILABLE' ? 'success' : 'warning'}>
            {simulation.distanceKm != null ? `Distância pelas ruas: ${String(simulation.distanceKm).replace('.', ',')} km. ` : ''}
            {simulation.deliveryFee != null ? `Taxa calculada: R$ ${Number(simulation.deliveryFee).toFixed(2).replace('.', ',')}. ` : ''}
            {simulation.message}
          </Alert>
        ) : null}
      </Box>
    </Box>
  );
}
