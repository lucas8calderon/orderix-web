import { fireEvent, render, screen } from '@testing-library/react';
import { SettingsFinder } from './SettingsFinder';

test('finds accented settings and opens the correct existing form', () => {
  const navigate = jest.fn();
  render(<SettingsFinder onNavigate={navigate} />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'horarios' } });
  fireEvent.click(screen.getByRole('button', { name: /Horários de funcionamento/ }));
  expect(navigate).toHaveBeenCalledWith('horarios');
  expect(screen.getByRole('searchbox')).toHaveValue('');
});

test('reports no results and allows clearing the query', () => {
  render(<SettingsFinder onNavigate={jest.fn()} />);
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzzz' } });
  expect(screen.getByRole('status')).toHaveTextContent('Nenhuma opção encontrada');
  fireEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
  expect(screen.queryByRole('status')).not.toBeInTheDocument();
});
