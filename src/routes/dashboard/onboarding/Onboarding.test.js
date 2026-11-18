import { act, fireEvent, render, renderHook, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import WelcomeOnboarding, { buildSteps } from './WelcomeOnboarding';
import SetupChecklist from './SetupChecklist';
import { useOnboarding } from './useOnboarding';
import { ONBOARDING_SUPPORT_MESSAGE, onboardingSupportUrl } from '../../../services/onboardingService';
import { WHATSAPP_NUMBER } from '../../home/landingAssets';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  defaults: { headers: { common: {} } },
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
}));

beforeEach(() => {
  axios.get.mockReset();
  axios.post.mockReset();
  axios.patch.mockReset();
  axios.post.mockResolvedValue({ data: {} });
  axios.patch.mockResolvedValue({ data: {} });
});

function renderWelcome(props = {}) {
  const onFinish = jest.fn();
  const onStep = jest.fn();
  render(<WelcomeOnboarding open storeName="Pizzaria Bella Napoli" onFinish={onFinish} onStep={onStep} {...props} />);
  return { onFinish, onStep };
}

describe('carrossel de boas-vindas', () => {
  test('primeira tela personaliza com o nome da loja e oferece pular', () => {
    const { onFinish } = renderWelcome();

    expect(screen.getByRole('heading', { name: 'Bem-vindo à Weper, Pizzaria Bella Napoli! 🎉' })).toBeInTheDocument();
    expect(screen.getByText('Uma nova etapa começa agora.')).toBeInTheDocument();
    expect(screen.getByText('1 de 5')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Voltar/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Pular apresentação' }));
    expect(onFinish).toHaveBeenCalledWith('skip');
  });

  test('sem nome da loja usa a saudação padrão', () => {
    expect(buildSteps('')[0].title).toBe('Bem-vindo à Weper! 🎉');
  });

  test('navega pelas cinco etapas com Continuar e Voltar e salva o progresso', () => {
    const { onStep, onFinish } = renderWelcome();

    fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
    expect(screen.getByTestId('onb-step-platform')).toBeInTheDocument();
    expect(screen.getByText('Delivery próprio')).toBeInTheDocument();
    expect(onStep).toHaveBeenLastCalledWith(1);

    fireEvent.click(screen.getByRole('button', { name: /Voltar/ }));
    expect(screen.getByTestId('onb-step-welcome')).toBeInTheDocument();

    for (let i = 0; i < 4; i += 1) fireEvent.click(screen.getByRole('button', { name: /Continuar/ }));
    expect(screen.getByTestId('onb-step-start')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Continuar/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Começar a configurar minha loja/ }));
    expect(onFinish).toHaveBeenCalledWith('complete');
  });

  test('última tela permite explorar por conta própria', () => {
    const { onFinish } = renderWelcome({ initialStep: 4 });

    fireEvent.click(screen.getByRole('button', { name: 'Explorar por conta própria' }));
    expect(onFinish).toHaveBeenCalledWith('explore');
  });

  test('setas do teclado trocam de etapa', () => {
    renderWelcome();
    const dialog = screen.getByRole('dialog');

    fireEvent.keyDown(dialog, { key: 'ArrowRight' });
    expect(screen.getByTestId('onb-step-platform')).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'ArrowLeft' });
    expect(screen.getByTestId('onb-step-welcome')).toBeInTheDocument();
  });

  test('etapa de delivery não promete aumento de faturamento', () => {
    renderWelcome({ initialStep: 2 });
    expect(screen.getByText('Seu negócio. Seus clientes. Suas vendas.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).not.toHaveTextContent(/garant|aumento de faturamento|substitui/i);
  });

  test('etapa de suporte abre o WhatsApp oficial com a mensagem do onboarding', () => {
    renderWelcome({ initialStep: 3 });
    const link = screen.getByRole('link', { name: /Falar com suporte/ });
    const url = new URL(link.getAttribute('href'));
    expect(url.pathname).toBe(`/${WHATSAPP_NUMBER}`);
    expect(url.searchParams.get('text')).toBe(ONBOARDING_SUPPORT_MESSAGE);
    expect(link).toHaveAttribute('target', '_blank');
  });
});

describe('checklist', () => {
  const tasks = [
    { id: 'store_info', done: true },
    { id: 'products', done: true },
    { id: 'payments', done: false },
    { id: 'channel', done: false },
    { id: 'first_order', done: false },
  ];

  function renderChecklist(checklist, handlers = {}) {
    return render(
      <MemoryRouter>
        <SetupChecklist checklist={checklist} onDismiss={handlers.onDismiss || jest.fn()} onAcknowledge={handlers.onAcknowledge || jest.fn()} />
      </MemoryRouter>,
    );
  }

  test('mostra progresso real e atalhos só das tarefas pendentes', () => {
    renderChecklist({ visible: true, tasks, completedCount: 2, allDone: false });

    expect(screen.getByRole('heading', { name: 'Prepare sua loja para vender' })).toBeInTheDocument();
    expect(screen.getByText('2 de 5')).toBeInTheDocument();
    expect(screen.getByText(/Cadastrar informações da loja/)).toHaveTextContent('(concluído)');
    expect(screen.getByRole('link', { name: 'Configurar recebimentos: abrir' })).toHaveAttribute('href', '/app/configuracoes/pagamentos');
    expect(screen.getByRole('link', { name: 'Realizar um pedido de teste: abrir' })).toHaveAttribute('href', '/app/atendimento');
    expect(screen.queryByRole('link', { name: 'Adicionar produtos ao cardápio: abrir' })).not.toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Fale com a Weper/ })).toHaveAttribute('href', onboardingSupportUrl());
  });

  test('dispensar chama o backend', () => {
    const onDismiss = jest.fn();
    renderChecklist({ visible: true, tasks, completedCount: 2, allDone: false }, { onDismiss });
    fireEvent.click(screen.getByRole('button', { name: 'Dispensar checklist' }));
    expect(onDismiss).toHaveBeenCalled();
  });

  test('tudo concluído mostra a mensagem de sucesso', () => {
    const onAcknowledge = jest.fn();
    renderChecklist({ visible: true, tasks: tasks.map((t) => ({ ...t, done: true })), completedCount: 5, allDone: true }, { onAcknowledge });

    expect(screen.getByText('Sua loja está pronta para começar! 🎉')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(onAcknowledge).toHaveBeenCalled();
  });

  test('oculto ou sem dados não renderiza nada', () => {
    const { container } = renderChecklist({ visible: false, tasks, completedCount: 2 });
    expect(container).toBeEmptyDOMElement();
  });
});

describe('primeiro acesso', () => {
  function mockStatus(status, checklist = { visible: true, tasks: [], completedCount: 0 }) {
    axios.get.mockImplementation((url) => Promise.resolve({ data: url.endsWith('/status') ? status : checklist }));
  }

  test('administrador da loja no primeiro acesso vê a apresentação e o início é registrado', async () => {
    mockStatus({ eligible: true, status: 'NOT_STARTED', currentStep: 0, showWelcome: true, storeName: 'Bella' });

    const { result } = renderHook(() => useOnboarding({ role: 'STORE_ADMIN' }));

    await waitFor(() => expect(result.current.welcomeOpen).toBe(true));
    expect(result.current.storeName).toBe('Bella');
    expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/onboarding\/start$/));
  });

  test('segundo acesso, depois de concluído, não reabre sozinho', async () => {
    mockStatus({ eligible: true, status: 'COMPLETED', currentStep: 4, showWelcome: false, storeName: 'Bella' });

    const { result } = renderHook(() => useOnboarding({ role: 'STORE_ADMIN' }));

    await waitFor(() => expect(result.current.eligible).toBe(true));
    expect(result.current.welcomeOpen).toBe(false);
    expect(axios.post).not.toHaveBeenCalled();
  });

  test.each(['WAITER', 'CASHIER', 'KITCHEN', 'MASTER', 'SUPER_ADMIN', 'PARTNER'])('%s não consulta nem vê o onboarding', async (role) => {
    const { result } = renderHook(() => useOnboarding({ role }));

    await act(async () => {});
    expect(axios.get).not.toHaveBeenCalled();
    expect(result.current.eligible).toBe(false);
  });

  test('erro temporário do backend não abre nada nem quebra o painel', async () => {
    axios.get.mockRejectedValue(new Error('network'));

    const { result } = renderHook(() => useOnboarding({ role: 'STORE_ADMIN' }));

    await act(async () => {});
    expect(result.current.welcomeOpen).toBe(false);
    expect(result.current.eligible).toBe(false);
  });

  test('pular registra a dispensa; rever pela Ajuda não mexe no estado salvo', async () => {
    mockStatus({ eligible: true, status: 'IN_PROGRESS', currentStep: 2, showWelcome: true, storeName: 'Bella' });
    const { result } = renderHook(() => useOnboarding({ role: 'STORE_ADMIN' }));
    await waitFor(() => expect(result.current.welcomeOpen).toBe(true));
    expect(result.current.initialStep).toBe(2);

    act(() => result.current.onFinish('skip'));
    expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/onboarding\/dismiss$/));

    axios.post.mockClear();
    act(() => result.current.openWelcome());
    expect(result.current.welcomeOpen).toBe(true);
    act(() => result.current.onStep(3));
    act(() => result.current.onFinish('complete'));
    expect(axios.patch).not.toHaveBeenCalled();
    expect(axios.post).not.toHaveBeenCalledWith(expect.stringMatching(/\/complete$/));
  });

  test('concluir pela última tela registra a conclusão', async () => {
    mockStatus({ eligible: true, status: 'IN_PROGRESS', currentStep: 4, showWelcome: true, storeName: 'Bella' });
    const { result } = renderHook(() => useOnboarding({ role: 'STORE_ADMIN' }));
    await waitFor(() => expect(result.current.welcomeOpen).toBe(true));

    act(() => result.current.onFinish('complete'));
    expect(axios.post).toHaveBeenCalledWith(expect.stringMatching(/\/api\/onboarding\/complete$/));
  });
});
