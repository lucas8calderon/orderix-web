import { fireEvent, render, screen } from '@testing-library/react';
import { HoursCard } from './HoursCard';
import { createDefaultSchedule } from '../../../../services/storeHoursService';

describe('HoursCard', () => {
  it('mostra loja fechada quando nenhum dia está ativo e dispara salvar', () => {
    const onSave = jest.fn();
    const schedule = createDefaultSchedule().map((day) => ({
      ...day,
      enabled: false,
      intervals: [],
    }));

    render(
      <HoursCard
        settings={{
          schedule,
          deliveryEnabled: false,
        }}
        onSettingChange={jest.fn()}
        onSave={onSave}
        switchStyles={{}}
        saving={false}
      />
    );

    expect(screen.getByText('Horários de funcionamento')).toBeInTheDocument();
    expect(screen.getByText('Fechado no momento')).toBeInTheDocument();
    expect(screen.getByText('Domingo')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /salvar/i }));
    expect(onSave).toHaveBeenCalledWith('hours');
  });

  it('permite adicionar intervalo em um dia ativo', () => {
    const onSettingChange = jest.fn();
    const schedule = createDefaultSchedule();

    render(
      <HoursCard
        settings={{ schedule, deliveryEnabled: false }}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        switchStyles={{}}
        saving={false}
      />
    );

    fireEvent.click(screen.getAllByRole('button', { name: /adicionar intervalo/i })[0]);
    expect(onSettingChange).toHaveBeenCalled();
    const [, , nextSchedule] = onSettingChange.mock.calls.at(-1);
    const sunday = nextSchedule.find((day) => day.weekday === 7);
    expect(sunday.intervals).toHaveLength(2);
  });
});
