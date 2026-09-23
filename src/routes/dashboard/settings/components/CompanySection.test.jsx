import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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
    expect(onSettingChange).toHaveBeenCalledWith('deliveryLogoUrl', null, '');
  });
});
