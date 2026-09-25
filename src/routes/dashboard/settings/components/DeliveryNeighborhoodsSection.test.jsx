import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeliveryNeighborhoodsSection } from './DeliveryNeighborhoodsSection';
import { listStoreNeighborhoods } from '../../../../services/deliveryNeighborhoodService';

jest.mock('../../../../services/deliveryNeighborhoodService', () => ({
  listStoreNeighborhoods: jest.fn(),
  createStoreNeighborhood: jest.fn(),
  updateStoreNeighborhood: jest.fn(),
  deleteStoreNeighborhood: jest.fn(),
}));

const rows = [
  { id: 1, name: 'Centro', city: 'São Paulo', state: 'SP', fee: 8.5, freeDelivery: true, active: true },
  { id: 2, name: 'Jardins', city: 'São Paulo', state: 'SP', fee: 12, freeDelivery: false, active: true },
];

describe('DeliveryNeighborhoodsSection', () => {
  beforeEach(() => {
    listStoreNeighborhoods.mockResolvedValue({ data: rows });
  });

  it('mostra taxa cadastrada, taxa efetiva e os bairros grátis do modo selecionado', async () => {
    const onSettingChange = jest.fn();
    render(
      <DeliveryNeighborhoodsSection
        settings={{ deliveryFeeMode: 'FREE_SELECTED', storePhone: '11988887777' }}
        onSettingChange={onSettingChange}
      />
    );

    expect(await screen.findByText('Centro')).toBeInTheDocument();
    expect(screen.getByText('Grátis agora: Centro')).toBeInTheDocument();
    expect(screen.getByText('R$ 8,50')).toBeInTheDocument();
    expect(screen.getAllByText('Entrega grátis').length).toBeGreaterThan(0);
    expect(screen.getAllByText('R$ 12,00').length).toBeGreaterThan(0);

    await userEvent.click(screen.getByRole('radio', { name: 'Grátis em todos os bairros atendidos' }));
    expect(onSettingChange).toHaveBeenCalledWith('deliveryFeeMode', null, 'FREE_ALL');
  });

  it('indica que todos os atendidos estão grátis e avisa loja sem WhatsApp', async () => {
    render(
      <DeliveryNeighborhoodsSection
        settings={{ deliveryFeeMode: 'FREE_ALL', storePhone: '' }}
        onSettingChange={jest.fn()}
      />
    );

    expect(await screen.findByText(/todos os bairros ativos desta loja estão com entrega grátis/i)).toBeInTheDocument();
    expect(screen.getByText(/whatsapp da loja pendente/i)).toBeInTheDocument();
  });

  it('filtra a lista pelo nome do bairro', async () => {
    render(
      <DeliveryNeighborhoodsSection
        settings={{ deliveryFeeMode: 'PER_NEIGHBORHOOD', storePhone: '11988887777' }}
        onSettingChange={jest.fn()}
      />
    );
    expect(await screen.findByText('Jardins')).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText(/pesquisar bairro ou cidade/i), 'jard');
    expect(screen.queryByText('Centro')).not.toBeInTheDocument();
    expect(screen.getByText('Jardins')).toBeInTheDocument();
  });
});
