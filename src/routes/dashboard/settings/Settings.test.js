import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Settings } from './Settings';
import { useSettingsState } from './hooks/useSettingsState';
import { fileToCompressedDataUrl } from '../menu/utils/compressImage';

jest.mock('./hooks/useSettingsState', () => ({
  useSettingsState: jest.fn(),
  useSliderStyles: () => ({}),
  useSwitchStyles: () => ({}),
}));

jest.mock('../../../services/authService', () => ({
  getCurrentUser: () => ({ storeName: 'Loja Teste' }),
}));

jest.mock('../menu/utils/compressImage', () => ({
  fileToCompressedDataUrl: jest.fn(),
}));

const baseState = {
  settings: {
    serviceFee: 10,
    timing: 'AFTER_KITCHEN',
    tableTiming: 'AFTER_KITCHEN',
    comandaTiming: 'AFTER_KITCHEN',
    counterTiming: 'AFTER_KITCHEN',
    tablePaymentMode: 'MANUAL_CONFIRMATION',
    comandaPaymentMode: 'MANUAL_CONFIRMATION',
    counterPaymentMode: 'MANUAL_CONFIRMATION',
    waiterPaymentEnabled: true,
    paymentMethods: { PIX: true, DEBIT: true, CREDIT: true, CASH: true, VOUCHER: false, OTHER: false },
    defaultProvider: 'NONE',
    tablePaymentProvider: 'NONE',
    comandaPaymentProvider: 'NONE',
    counterPaymentProvider: 'NONE',
    tableFallbackMode: 'BLOCK',
    comandaFallbackMode: 'BLOCK',
    counterFallbackMode: 'BLOCK',
    infinitePayHandle: '',
    infinitePayDocument: '',
    publicMenuEnabled: true,
    publicMenuShowUnavailable: false,
    slug: 'loja-teste',
    storeName: 'Loja Teste',
    schedule: [
      { weekday: 1, enabled: true, intervals: [{ open: '08:00', close: '22:00' }] },
    ],
    deliveryEnabled: true,
    deliveryFee: 5,
    deliveryMinOrder: 35,
    deliveryEstimatedMinutes: 40,
    storeAddress: 'Rua A, 1',
    deliveryLogoUrl: '',
    deliveryCoverUrl: '',
    permissions: {
      admin: { viewDashboard: true, manageSettings: true },
    },
    companyInfo: {
      companyName: 'Empresa Teste',
      cnpj: '00.000.000/0001-00',
      address: 'Rua A',
      phone: '(11) 1111-1111',
    },
  },
  loading: false,
  saving: false,
  toast: { open: false, message: '', severity: 'success' },
  setToast: jest.fn(),
  showToast: jest.fn(),
  updateSetting: jest.fn(),
  updatePermission: jest.fn(),
  saveSettings: jest.fn(),
  getPaymentMethodLabel: (m) => m,
  getProfileLabel: (p) => p,
  getPermissionLabel: (p) => p,
};

function renderSettings(initialPath = '/app/configuracoes/geral') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/app/:section/*" element={<Settings />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Settings page navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useSettingsState.mockReturnValue(baseState);
    fileToCompressedDataUrl.mockReset();
  });

  it('mostra a visão geral com hub do layout de referência', async () => {
    renderSettings('/app/configuracoes/geral');
    expect(await screen.findByRole('heading', { name: /configurações da loja/i })).toBeInTheDocument();
    expect(screen.getByText(/gerencie todas as informações e preferências do seu estabelecimento/i)).toBeInTheDocument();
    expect(screen.getByText('Loja ativa')).toBeInTheDocument();
    expect(screen.getByText('Status da sua loja')).toBeInTheDocument();
    expect(screen.getByText('Configurações rápidas')).toBeInTheDocument();
    expect(screen.getByText('Dicas da Weper')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editar informações/i })).toBeInTheDocument();
    expect(screen.getByText('Personalização visual')).toBeInTheDocument();
    expect(screen.getByText('Delivery ativo')).toBeInTheDocument();
  });

  it('não navega para canais ao adicionar banner; o upload fica na visão geral', async () => {
    fileToCompressedDataUrl.mockResolvedValue('data:image/jpeg;base64,banner');
    renderSettings('/app/configuracoes/geral');

    fireEvent.click(screen.getByRole('button', { name: /adicionar banner da loja/i }));

    expect(screen.queryByText('Delivery habilitado')).not.toBeInTheDocument();
    expect(screen.getByText('Personalização visual')).toBeInTheDocument();

    const input = screen.getByLabelText('Arquivo do banner');
    const file = new File(['banner'], 'banner.jpg', { type: 'image/jpeg' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(baseState.updateSetting).toHaveBeenCalledWith(
        'deliveryCoverUrl',
        null,
        'data:image/jpeg;base64,banner'
      );
    });
    expect(screen.queryByText('Delivery habilitado')).not.toBeInTheDocument();
  });

  it('permite upload de logo na visão geral sem ir para empresa', async () => {
    fileToCompressedDataUrl.mockResolvedValue('data:image/jpeg;base64,logo');
    renderSettings('/app/configuracoes/geral');

    const input = screen.getByLabelText('Arquivo do logotipo');
    const file = new File(['logo'], 'logo.png', { type: 'image/png' });
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(baseState.updateSetting).toHaveBeenCalledWith(
        'deliveryLogoUrl',
        null,
        'data:image/jpeg;base64,logo'
      );
    });
    expect(screen.queryByText(/dados fiscais e empresa/i)).not.toBeInTheDocument();
  });

  it('abre Delivery pelo grupo Canais', async () => {
    renderSettings('/app/configuracoes/geral');
    fireEvent.click(screen.getByRole('tab', { name: /canais e delivery/i }));
    expect(await screen.findByText('Delivery habilitado')).toBeInTheDocument();
    expect(screen.getByText('Pagamentos online')).toBeInTheDocument();
    expect(screen.queryByText(/banner \(capa\)/i)).not.toBeInTheDocument();
  });

  it('abre Operação com horários e taxa de serviço', async () => {
    renderSettings('/app/configuracoes/geral');
    fireEvent.click(screen.getByRole('tab', { name: /operação/i }));
    expect(await screen.findByText(/horários de funcionamento/i)).toBeInTheDocument();
    expect(screen.getByText('Taxa de Serviço')).toBeInTheDocument();
  });

  it('abre Cardápio e Produtos com atalho para o catálogo', async () => {
    renderSettings('/app/configuracoes/cardapio');
    expect(await screen.findByText(/cardápio digital \(qr\)/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /abrir catálogo/i })).toBeInTheDocument();
  });

  it('abre Equipe com permissões', async () => {
    renderSettings('/app/configuracoes/equipe');
    expect(await screen.findByText(/perfis e permissões/i)).toBeInTheDocument();
  });

  it('abre Vendas e Pagamentos', async () => {
    renderSettings('/app/configuracoes/vendas');
    expect(await screen.findByText(/pedidos e pagamentos/i)).toBeInTheDocument();
  });

  it('abre Empresa pelo grupo', async () => {
    renderSettings('/app/configuracoes/geral');
    fireEvent.click(screen.getByRole('tab', { name: /empresa/i }));
    expect(await screen.findByText(/dados fiscais e empresa/i)).toBeInTheDocument();
  });

  it('mantém rota antiga de delivery', async () => {
    renderSettings('/app/configuracoes/delivery');
    expect(await screen.findByText('Delivery habilitado')).toBeInTheDocument();
    expect(screen.getByText('Pagamentos online')).toBeInTheDocument();
  });

  it('canonicaliza /app/configuracoes para a visão geral', async () => {
    renderSettings('/app/configuracoes');
    expect(await screen.findByText('Status da sua loja')).toBeInTheDocument();
  });
});
