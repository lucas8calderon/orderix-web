import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CourierRoutePage from './CourierRoutePage';
import { confirmPublicDeliveryStop, getPublicDeliveryRoute } from '../../services/deliveryRouteApi';
import { googleMapsUrl, wazeUrl } from './courierRouteLinks';

jest.mock('../../services/deliveryRouteApi', () => ({
  getPublicDeliveryRoute: jest.fn(),
  confirmPublicDeliveryStop: jest.fn(),
  newIdempotencyKey: () => '11111111-1111-4111-8111-111111111111',
  apiErrorMessage: (error, fallback) => error?.response?.data?.message || fallback,
}));

const route = {
  storeName: 'Weper Burger',
  courierName: 'João',
  status: 'IN_PROGRESS',
  stopCount: 2,
  finishedCount: 0,
  currentStopId: 9,
  manualOrder: true,
  stops: [
    {
      id: 9,
      sequence: 1,
      orderLabel: '0040',
      address: 'Rua A, 10 — Centro',
      complement: 'Apto 2',
      reference: 'portão azul',
      status: 'PENDING',
    },
    {
      id: 10,
      sequence: 2,
      orderLabel: '0041',
      address: 'Rua B, 20',
      status: 'PENDING',
    },
  ],
};

function renderPage(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/rotas" element={<CourierRoutePage />} />
        <Route path="/rotas/:token" element={<CourierRoutePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('página do motoboy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('não quebra quando o token não vem no link', () => {
    renderPage('/rotas');
    expect(screen.getByRole('heading', { name: 'Minha rota de entregas' })).toBeInTheDocument();
    expect(screen.getByText('Este link de rota está incompleto.')).toBeInTheDocument();
    expect(getPublicDeliveryRoute).not.toHaveBeenCalled();
  });

  it('abre mapa só da parada atual e o pop-up cancelado não confirma', async () => {
    getPublicDeliveryRoute.mockResolvedValue({ data: route });
    renderPage('/rotas/token-publico');

    const destination = 'Rua A, 10 — Centro, Apto 2';
    const maps = await screen.findByRole('link', { name: 'Abrir no Google Maps' });
    const waze = screen.getByRole('link', { name: 'Abrir no Waze' });
    expect(maps).toHaveAttribute('href', googleMapsUrl(destination));
    expect(waze).toHaveAttribute('href', wazeUrl(destination));
    expect(decodeURIComponent(maps.getAttribute('href'))).toContain(destination);
    expect(screen.getAllByRole('link')).toHaveLength(2);

    fireEvent.click(maps);
    expect(confirmPublicDeliveryStop).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar entrega' }));
    expect(screen.getByRole('dialog', { name: 'Confirmar esta entrega?' })).toBeInTheDocument();
    expect(screen.queryByLabelText('PIN da rota')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(confirmPublicDeliveryStop).not.toHaveBeenCalled();
  });

  it('confirma a entrega sem PIN', async () => {
    getPublicDeliveryRoute.mockResolvedValue({ data: route });
    confirmPublicDeliveryStop.mockResolvedValue({
      data: {
        ...route,
        finishedCount: 1,
        currentStopId: 10,
        stops: [{ ...route.stops[0], status: 'DELIVERED' }, route.stops[1]],
      },
    });
    renderPage('/rotas/token-publico');

    fireEvent.click(await screen.findByRole('button', { name: 'Confirmar entrega' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => expect(confirmPublicDeliveryStop).toHaveBeenCalledTimes(1));
    expect(confirmPublicDeliveryStop).toHaveBeenCalledWith(
      'token-publico',
      9,
      { outcome: 'DELIVERED' },
      '11111111-1111-4111-8111-111111111111',
    );
    expect(await screen.findByText('Entregue')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('pede confirmação antes de marcar que não foi possível entregar', async () => {
    getPublicDeliveryRoute.mockResolvedValue({ data: route });
    renderPage('/rotas/token-publico');

    fireEvent.click(await screen.findByRole('button', { name: 'Não foi possível entregar' }));
    expect(screen.getByRole('dialog', { name: 'Não foi possível entregar?' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(confirmPublicDeliveryStop).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
