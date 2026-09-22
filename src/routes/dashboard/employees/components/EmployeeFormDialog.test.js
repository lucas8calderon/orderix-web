import { fireEvent, render, screen } from '@testing-library/react';
import { EmployeeFormDialog } from './EmployeeFormDialog';
import { EmployeesContext } from '../provider/EmployeesContext';

function renderDialog(employee = null, onSaveEmployee = jest.fn()) {
  return render(
    <EmployeesContext.Provider value={{ onAddEmployeeResult: {}, selectedEmployee: employee }}>
      <EmployeeFormDialog
        open
        onClose={jest.fn()}
        onSaveEmployee={onSaveEmployee}
        employee={employee}
      />
    </EmployeesContext.Provider>,
  );
}

describe('EmployeeFormDialog', () => {
  it('não mostra seletor de adquirente', () => {
    renderDialog();
    expect(screen.queryByLabelText(/como cobra/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/cargo/i)).toBeInTheDocument();
  });

  it('salva colaborador sem chargeProvider', () => {
    const onSaveEmployee = jest.fn();
    renderDialog(null, onSaveEmployee);

    fireEvent.change(screen.getByLabelText(/nome e sobrenome/i), { target: { value: 'Lucas Getnet' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'lucas@gmail.com' } });
    fireEvent.change(screen.getByLabelText(/^senha/i), { target: { value: '123456' } });
    fireEvent.mouseDown(screen.getByLabelText(/cargo/i));
    fireEvent.click(screen.getByRole('option', { name: 'Garçom' }));
    fireEvent.click(screen.getByRole('button', { name: /cadastrar colaborador/i }));

    expect(onSaveEmployee).toHaveBeenCalledWith(expect.objectContaining({
      email: 'lucas@gmail.com',
      profile: 'GARCOM',
    }));
    expect(onSaveEmployee.mock.calls[0][0].chargeProvider).toBeUndefined();
  });
});
