import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Settings } from './Settings';
import { useSettingsState } from './hooks/useSettingsState';

jest.mock('./hooks/useSettingsState', () => ({
  useSettingsState: jest.fn(),
  useSliderStyles: () => ({}),
  useSwitchStyles: () => ({}),
}));

const baseState = {
  settings: {
    serviceFee: 10,
    timing: 'AFTER_KITCHEN',
    waiterPaymentEnabled: true,
    paymentMethods: { PIX: true, DEBIT: true, CREDIT: true, CASH: true, VOUCHER: false, OTHER: false },
    defaultProvider: 'MANUAL',
    infinitePayHandle: '',
    infinitePayDocument: '',
    publicMenuEnabled: true,
    publicMenuShowUnavailable: false,
    slug: 'loja-teste',
    storeName: 'Loja Teste',
    schedule: [],
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
  });

  it('mostra overview Geral com atalhos Editar', async () => {
    renderSettings('/app/configuracoes/geral');
    expect(await screen.findByRole('heading', { name: /configurações da loja/i })).toBeInTheDocument();
    expect(screen.getByText('Informações da Loja')).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /editar/i }).length).toBeGreaterThan(0);
  });

  it('navega para a aba Delivery ao clicar na tab', async () => {
    renderSettings('/app/configuracoes/geral');
    fireEvent.click(screen.getByRole('tab', { name: /delivery/i }));
    expect(await screen.findByText('Delivery habilitado')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('canonicaliza /app/configuracoes para /geral', async () => {
    renderSettings('/app/configuracoes');
    expect(await screen.findByText('Informações da Loja')).toBeInTheDocument();
  });
});
