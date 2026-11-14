import { useState } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { CEP_NOT_FOUND, lookupCep } from '../../../../services/viaCepService';
import { StoreOriginAddressFields } from './StoreOriginAddressFields';

jest.mock('../../../../services/viaCepService', () => ({
  lookupCep: jest.fn(),
  CEP_NOT_FOUND: 'CEP_NOT_FOUND',
}));

const foundAddress = {
  postalCode: '01310-100',
  street: 'Avenida Paulista',
  neighborhood: 'Bela Vista',
  city: 'São Paulo',
  state: 'SP',
};

function Harness({ initial = 'estrada de são bento, 1148' }) {
  const [address, setAddress] = useState(initial);
  return (
    <StoreOriginAddressFields
      storeAddress={address}
      onStoreAddressChange={setAddress}
    />
  );
}

async function typeCep(value) {
  fireEvent.change(screen.getByLabelText('CEP do endereço de origem'), {
    target: { value },
  });
  await act(async () => {
    jest.advanceTimersByTime(300);
    await Promise.resolve();
  });
}

describe('StoreOriginAddressFields', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    lookupCep.mockReset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('preenche rua, bairro, cidade e UF e só grava o texto depois do número', async () => {
    lookupCep.mockResolvedValue(foundAddress);
    const onStoreAddressChange = jest.fn();
    render(
      <StoreOriginAddressFields
        storeAddress="estrada de são bento, 1148"
        onStoreAddressChange={onStoreAddressChange}
      />
    );

    await typeCep('01310100');

    expect(screen.getByDisplayValue('Avenida Paulista')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Bela Vista')).toBeInTheDocument();
    expect(screen.getByDisplayValue('São Paulo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('SP')).toBeInTheDocument();
    expect(screen.getByText('Endereço encontrado. Confira o número.')).toBeInTheDocument();
    expect(screen.getByLabelText('Endereço de origem da entrega')).toHaveValue('estrada de são bento, 1148');
    expect(onStoreAddressChange).not.toHaveBeenCalled();
    expect(lookupCep).toHaveBeenCalledWith('01310100', expect.objectContaining({ signal: expect.any(AbortSignal) }));

    fireEvent.change(screen.getByLabelText('Número do endereço de origem'), {
      target: { value: '1148' },
    });

    expect(onStoreAddressChange).toHaveBeenCalledWith(
      'Avenida Paulista, 1148, Bela Vista, São Paulo - SP'
    );
    expect(onStoreAddressChange.mock.calls.every(([value]) => typeof value === 'string')).toBe(true);
  });

  it('não apaga o que já estava digitado quando o CEP não existe', async () => {
    lookupCep.mockRejectedValue(Object.assign(new Error(CEP_NOT_FOUND), { code: CEP_NOT_FOUND }));
    render(<Harness />);

    fireEvent.change(screen.getByLabelText('Rua do endereço de origem'), {
      target: { value: 'Rua Velha' },
    });
    fireEvent.change(screen.getByLabelText('Número do endereço de origem'), {
      target: { value: '10' },
    });
    expect(screen.getByLabelText('Endereço de origem da entrega')).toHaveValue('Rua Velha, 10');

    await typeCep('00000000');

    expect(screen.getByRole('alert')).toHaveTextContent('CEP não encontrado.');
    expect(screen.getByLabelText('Rua do endereço de origem')).toHaveValue('Rua Velha');
    expect(screen.getByLabelText('Número do endereço de origem')).toHaveValue('10');
    expect(screen.getByLabelText('Endereço de origem da entrega')).toHaveValue('Rua Velha, 10');
  });
});
