import { fireEvent, render, screen } from '@testing-library/react';
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

  it('abre mapa só da parada atual e exige o PIN', async () => {
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
    fireEvent.click(screen.getByRole('button', { name: 'Enviar PIN' }));
    expect(screen.getByText('Informe o PIN de 6 dígitos.')).toBeInTheDocument();
    expect(confirmPublicDeliveryStop).not.toHaveBeenCalled();
  });
});
