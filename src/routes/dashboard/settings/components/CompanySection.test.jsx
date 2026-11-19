import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CLEARED_BRANDING_IMAGE } from '../../../../services/deliveryService';
import { CompanySection } from './CompanySection';
import { fileToCompressedDataUrl } from '../../menu/utils/compressImage';

jest.mock('../../menu/utils/compressImage', () => ({
  fileToCompressedDataUrl: jest.fn(),
}));

const settings = {
  companyInfo: {
    companyName: 'Minions',
    cnpj: '',
    address: '',
    phone: '',
  },
  deliveryLogoUrl: '',
};

describe('CompanySection', () => {
  beforeEach(() => {
    fileToCompressedDataUrl.mockReset();
  });

  it('mostra o endereço fiscal salvo e ignora o endereço de retirada', () => {
    render(
      <CompanySection
        settings={{
          ...settings,
          storeAddress: 'Rua das Flores, 123 - Centro',
          companyInfo: {
            companyName: 'Minions',
            cnpj: '',
            address: 'Avenida Central, 9',
            phone: '',
          },
        }}
        onSettingChange={jest.fn()}
        onSave={jest.fn()}
        saving={false}
      />
    );

    expect(screen.getByLabelText('Endereço')).toHaveValue('Avenida Central, 9');
  });

  it('não preenche o endereço da empresa com o endereço de retirada', () => {
    render(
      <CompanySection
        settings={{
          ...settings,
          storeAddress: 'Rua das Flores, 123 - Centro',
          companyInfo: {
            companyName: '',
            cnpj: '',
            address: '',
            phone: '',
          },
        }}
        onSettingChange={jest.fn()}
        onSave={jest.fn()}
        saving={false}
      />
    );

    expect(screen.getByLabelText('Endereço')).toHaveValue('');
  });

  it('explica que os dados da empresa são gravados', () => {
    render(
      <CompanySection
        settings={settings}
        onSettingChange={jest.fn()}
        onSave={jest.fn()}
        saving={false}
      />
    );

    expect(screen.getByText(/gravados nesta loja/i)).toBeInTheDocument();
    expect(screen.queryByText(/ficam só nesta tela/i)).not.toBeInTheDocument();
  });

  it('mascara CNPJ e telefone enquanto digita', () => {
    const onSettingChange = jest.fn();
    render(
      <CompanySection
        settings={settings}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        saving={false}
      />
    );

    fireEvent.change(screen.getByLabelText('CNPJ'), { target: { value: '11222333000181' } });
    expect(onSettingChange).toHaveBeenCalledWith('companyInfo', 'cnpj', '11.222.333/0001-81');

    fireEvent.change(screen.getByLabelText('Telefone'), { target: { value: '1134567890' } });
    expect(onSettingChange).toHaveBeenCalledWith('companyInfo', 'phone', '(11) 3456-7890');
  });

  it('processa o arquivo e guarda o logotipo para salvar', async () => {
    const onSettingChange = jest.fn();
    fileToCompressedDataUrl.mockResolvedValue('data:image/jpeg;base64,logo');

    render(
      <CompanySection
        settings={settings}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        saving={false}
      />
    );

    const input = screen.getByLabelText('Arquivo do logotipo');
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(onSettingChange).toHaveBeenCalledWith(
        'deliveryLogoUrl',
        null,
        'data:image/jpeg;base64,logo'
      );
    });
  });

  it('mostra a prévia e permite remover o logotipo', () => {
    const onSettingChange = jest.fn();
    render(
      <CompanySection
        settings={{ ...settings, deliveryLogoUrl: 'data:image/jpeg;base64,abc' }}
        onSettingChange={onSettingChange}
        onSave={jest.fn()}
        saving={false}
      />
    );

    expect(screen.getByAltText('Logotipo da empresa')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /remover/i }));
    expect(onSettingChange).toHaveBeenCalledWith('deliveryLogoUrl', null, CLEARED_BRANDING_IMAGE);
  });
});
