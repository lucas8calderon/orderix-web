import { render, screen } from '@testing-library/react';
import { RadiusCoverageIllustration } from './RadiusCoverageIllustration';
import { COVERAGE_LAYOUT } from '../utils/radiusCoverageIllustration';

function pinDistance() {
  const pin = document.querySelector('[data-customer-x]');
  return Math.hypot(
    Number(pin.getAttribute('data-customer-x')) - COVERAGE_LAYOUT.cx,
    Number(pin.getAttribute('data-customer-y')) - COVERAGE_LAYOUT.cy
  );
}

describe('RadiusCoverageIllustration', () => {
  it('mostra a loja, o cliente e a etiqueta na distância do simulador', () => {
    const { rerender } = render(<RadiusCoverageIllustration distanceKm="" maxKm={6.5} />);
    expect(screen.getByText('Loja')).toBeInTheDocument();
    expect(screen.queryByText('Cliente')).not.toBeInTheDocument();
    expect(screen.getByRole('figure')).toHaveAttribute('data-zone', 'hidden');
    expect(screen.getByText(/figura ilustrativa/i)).toBeInTheDocument();
    expect(screen.getByText(/distância pelas ruas/i)).toBeInTheDocument();
    expect(screen.queryByText(/linha reta/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/haversine/i)).not.toBeInTheDocument();

    rerender(<RadiusCoverageIllustration distanceKm="6.5" maxKm={6.5} />);
    expect(screen.getByText('6,5 km')).toBeInTheDocument();
    expect(screen.getByText('Cliente')).toBeInTheDocument();
    expect(screen.getByRole('figure')).toHaveAttribute('data-zone', 'edge');
    expect(pinDistance()).toBeCloseTo(COVERAGE_LAYOUT.radius, 4);

    rerender(<RadiusCoverageIllustration distanceKm="3.25" maxKm={6.5} />);
    expect(screen.getByRole('figure')).toHaveAttribute('data-zone', 'inside');
    expect(pinDistance()).toBeCloseTo(COVERAGE_LAYOUT.radius / 2, 4);

    rerender(<RadiusCoverageIllustration distanceKm="8" maxKm={6.5} />);
    expect(screen.getByText('8 km')).toBeInTheDocument();
    expect(screen.getByRole('figure')).toHaveAttribute('data-zone', 'outside');
    expect(screen.getByText(/fora do círculo/i)).toBeInTheDocument();
    expect(pinDistance()).toBeGreaterThan(COVERAGE_LAYOUT.radius);
  });

  it('não anima quando o usuário prefere menos movimento', () => {
    window.matchMedia = jest.fn().mockImplementation(() => ({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    render(<RadiusCoverageIllustration distanceKm="6.5" maxKm={6.5} />);

    expect(screen.getByRole('figure')).toHaveAttribute('data-motion', 'reduced');
    expect(document.querySelector('.radius-coverage--still')).toBeInTheDocument();
  });
});
