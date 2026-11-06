import { fireEvent, render, screen } from '@testing-library/react';
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

  it('cobra a taxa única em todos os bairros e mantém a taxa cadastrada', async () => {
    const onSettingChange = jest.fn();
    render(
      <DeliveryNeighborhoodsSection
        settings={{
          deliveryFeeMode: 'ALL_NEIGHBORHOODS',
          deliveryAllNeighborhoodsFee: 10,
          storePhone: '11988887777',
        }}
        onSettingChange={onSettingChange}
      />
    );

    expect(await screen.findByText('Centro')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Taxa para todos os bairros' })).toBeChecked();
    expect(screen.getByLabelText('Taxa única para todos os bairros')).toHaveValue('10,00');
    expect(screen.getByText(/qualquer bairro é atendido, mesmo fora da lista/i)).toBeInTheDocument();
    expect(screen.getByText('R$ 8,50')).toBeInTheDocument();
    expect(screen.getByText('R$ 12,00')).toBeInTheDocument();
    expect(screen.getAllByText('R$ 10,00').length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText('Taxa única para todos os bairros'), {
      target: { value: '0' },
    });
    expect(onSettingChange).toHaveBeenCalledWith('deliveryAllNeighborhoodsFee', null, 0);
  });

  it('deixa a cidade inteira grátis sem apagar a taxa fixa já cadastrada', async () => {
    const onSettingChange = jest.fn();
    render(
      <DeliveryNeighborhoodsSection
        settings={{
          deliveryFeeMode: 'FREE_EVERYWHERE',
          deliveryAllNeighborhoodsFee: 10,
          storePhone: '11988887777',
        }}
        onSettingChange={onSettingChange}
      />
    );

    expect(await screen.findByText('Centro')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /^Grátis em todos os bairros$/ })).toBeChecked();
    expect(screen.queryByLabelText('Taxa única para todos os bairros')).not.toBeInTheDocument();
    expect(screen.getByText(/qualquer bairro é atendido e a entrega é grátis/i)).toBeInTheDocument();
    expect(screen.getAllByText('Entrega grátis').length).toBeGreaterThan(0);
    expect(screen.getByText('R$ 8,50')).toBeInTheDocument();
    expect(screen.getByText('R$ 12,00')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('radio', { name: 'Taxa para todos os bairros' }));
    expect(onSettingChange).toHaveBeenCalledWith('deliveryFeeMode', null, 'ALL_NEIGHBORHOODS');
    expect(onSettingChange).not.toHaveBeenCalledWith(
      'deliveryAllNeighborhoodsFee',
      null,
      expect.anything()
    );
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
