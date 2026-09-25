import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DeliverySettingsCard } from './DeliverySettingsCard';
import { listStoreNeighborhoods } from '../../../../services/deliveryNeighborhoodService';

jest.mock('../../../../services/deliveryNeighborhoodService', () => ({
  listStoreNeighborhoods: jest.fn(),
  createStoreNeighborhood: jest.fn(),
  updateStoreNeighborhood: jest.fn(),
  deleteStoreNeighborhood: jest.fn(),
}));

function renderCard(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('DeliverySettingsCard', () => {
  beforeEach(() => {
    listStoreNeighborhoods.mockResolvedValue({ data: [] });
  });

  const baseSettings = {
    deliveryEnabled: true,
    deliveryFee: 5.5,
    deliveryMinOrder: 20,
    deliveryEstimatedMinutes: 40,
    slug: 'loja-teste',
  };

  it('exibe valores monetários mascarados em pt-BR', () => {
    renderCard(
      <DeliverySettingsCard
        settings={baseSettings}
        onSettingChange={jest.fn()}
        onSave={jest.fn()}
        switchStyles={{}}
        saving={false}
      />
    );

    expect(screen.getByLabelText('Taxa de entrega em reais')).toHaveValue('5,50');
    expect(screen.getByLabelText('Pedido mínimo em reais')).toHaveValue('20,00');
  });

  it('envia número decimal ao alterar a taxa de entrega', () => {
    const onSettingChange = jest.fn();
    renderCard(
      <DeliverySettingsCard
        settings={baseSettings}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        switchStyles={{}}
        saving={false}
      />
    );

    fireEvent.change(screen.getByLabelText('Taxa de entrega em reais'), {
      target: { value: '750' },
    });

    expect(onSettingChange).toHaveBeenCalledWith('deliveryFee', null, 7.5);
  });

  it('dispara salvar da seção delivery', () => {
    const onSave = jest.fn();
    renderCard(
      <DeliverySettingsCard
        settings={baseSettings}
        onSettingChange={jest.fn()}
        onSave={onSave}
        switchStyles={{}}
        saving={false}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(onSave).toHaveBeenCalledWith('delivery');
  });

  it('não renderiza mais campos de logo ou banner', () => {
    renderCard(
      <DeliverySettingsCard
        settings={{
          ...baseSettings,
          deliveryLogoUrl: 'data:image/png;base64,abc',
          deliveryCoverUrl: 'https://cdn.example.com/cover.jpg',
        }}
        onSettingChange={jest.fn()}
        onSave={jest.fn()}
        switchStyles={{}}
        saving={false}
      />
    );

    expect(screen.queryByText(/banner \(capa\)/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/1600×600/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /alterar logo/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /escolher imagem/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/^visual$/i)).not.toBeInTheDocument();
  });

  it('permite escolher somente retirada', () => {
    const onSettingChange = jest.fn();
    renderCard(
      <DeliverySettingsCard
        settings={{ ...baseSettings, offersDelivery: true, offersPickup: true }}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        switchStyles={{}}
        saving={false}
      />
    );

    fireEvent.click(screen.getByRole('radio', { name: /somente retirada/i }));
    expect(onSettingChange).toHaveBeenCalledWith('offersDelivery', null, false);
    expect(onSettingChange).toHaveBeenCalledWith('offersPickup', null, true);
  });

  it('permite desligar pagamento na hora da entrega sem mexer na retirada', () => {
    const onSettingChange = jest.fn();
    renderCard(
      <DeliverySettingsCard
        settings={{
          ...baseSettings,
          offersDelivery: true,
          offersPickup: true,
          acceptPayOnDelivery: true,
          acceptPrepaidDelivery: true,
          acceptPayOnPickup: true,
          acceptPrepaidPickup: true,
        }}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        switchStyles={{}}
        saving={false}
      />
    );

    fireEvent.click(screen.getByRole('checkbox', { name: /aceitar pagar na hora na entrega/i }));
    expect(onSettingChange).toHaveBeenCalledWith('acceptPayOnDelivery', null, false);
    expect(onSettingChange).not.toHaveBeenCalledWith('acceptPayOnPickup', null, false);
  });

  it('impede deixar a retirada sem nenhuma forma de concluir o pedido', () => {
    const onSettingChange = jest.fn();
    const onToast = jest.fn();
    renderCard(
      <DeliverySettingsCard
        settings={{
          ...baseSettings,
          offersDelivery: false,
          offersPickup: true,
          acceptPayOnPickup: true,
          acceptPrepaidPickup: false,
        }}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        onToast={onToast}
        switchStyles={{}}
        saving={false}
      />
    );

    expect(screen.queryByRole('checkbox', { name: /aceitar pagar na hora na entrega/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('checkbox', { name: /aceitar pagar na hora na retirada/i }));
    expect(onSettingChange).not.toHaveBeenCalled();
    expect(onToast).toHaveBeenCalledWith(expect.stringMatching(/retirada/i), 'warning');
  });

  it('avisa quando o canal só aceita pagamento antecipado e não há meio online', () => {
    renderCard(
      <DeliverySettingsCard
        settings={{
          ...baseSettings,
          offersDelivery: true,
          offersPickup: false,
          acceptPayOnDelivery: false,
          acceptPrepaidDelivery: true,
          onlinePixEnabled: false,
          onlineCardEnabled: false,
        }}
        onSettingChange={jest.fn()}
        onSave={jest.fn()}
        switchStyles={{}}
        saving={false}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/não há pix nem cartão online/i);
  });
});
