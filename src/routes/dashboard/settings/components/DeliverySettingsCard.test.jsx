import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DeliverySettingsCard } from './DeliverySettingsCard';

function renderCard(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('DeliverySettingsCard', () => {
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

  it('exibe dicas de tamanho e permite remover logo/banner', () => {
    const onSettingChange = jest.fn();
    renderCard(
      <DeliverySettingsCard
        settings={{
          ...baseSettings,
          deliveryLogoUrl: 'data:image/png;base64,abc',
          deliveryCoverUrl: 'https://cdn.example.com/cover.jpg',
        }}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        switchStyles={{}}
        saving={false}
      />
    );

    expect(screen.getByText(/1600×600/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alterar logo/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /remover/i }));
    expect(onSettingChange).toHaveBeenCalledWith('deliveryCoverUrl', null, '');
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
});
