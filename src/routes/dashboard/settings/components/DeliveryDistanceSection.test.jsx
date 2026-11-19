import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { DeliveryDistanceSection } from './DeliveryDistanceSection';
import { lookupCep } from '../../../../services/viaCepService';

jest.mock('../../../../services/viaCepService', () => ({
  CEP_NOT_FOUND: 'CEP_NOT_FOUND',
  lookupCep: jest.fn(),
}));

jest.mock('../../../../services/deliveryService', () => ({
  simulateDeliveryDistance: jest.fn(),
}));

describe('DeliveryDistanceSection', () => {
  beforeEach(() => {
    lookupCep.mockReset();
  });

  it('consulta o CEP do destino e preenche a rua antes de pedir o número', async () => {
    lookupCep.mockResolvedValue({
      postalCode: '08598-403',
      street: 'Rua Gonçalves de Magalhães',
      neighborhood: 'Jardim Altos de Itaquá',
      city: 'Itaquaquecetuba',
      state: 'SP',
    });

    render(<DeliveryDistanceSection settings={{}} onSettingChange={jest.fn()} />);

    const destinationCep = screen.getAllByLabelText('CEP')[1];
    fireEvent.change(destinationCep, { target: { value: '08598403' } });

    await waitFor(() => expect(lookupCep).toHaveBeenCalledWith('08598403', expect.any(Object)));
    expect(await screen.findByDisplayValue('Rua Gonçalves de Magalhães')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Jardim Altos de Itaquá')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Itaquaquecetuba')).toBeInTheDocument();
    expect(screen.getByText('Endereço encontrado. Confira o número.')).toBeInTheDocument();
    expect(screen.getAllByLabelText('Número')[1]).toHaveValue('');
  });
});
