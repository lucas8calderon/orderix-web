import { render, screen } from '@testing-library/react';
import DeliveryStoreHeader from './DeliveryStoreHeader';

describe('DeliveryStoreHeader', () => {
  it('exibe capa e logo quando o catálogo traz coverUrl e logoUrl', () => {
    const { container } = render(
      <DeliveryStoreHeader
        catalog={{
          storeName: 'Padaria Belas Artes',
          open: true,
          coverUrl: 'https://cdn.example.com/cover.jpg',
          logoUrl: 'https://cdn.example.com/logo.png',
          estimatedMinutes: 40,
        }}
      />
    );

    expect(screen.getByRole('heading', { name: 'Padaria Belas Artes' })).toBeInTheDocument();
    const cover = container.querySelector('.delivery-store-cover');
    expect(cover).not.toHaveClass('is-fallback');
    expect(cover).toHaveStyle({
      backgroundImage: 'url(https://cdn.example.com/cover.jpg)',
    });
    expect(container.querySelector('.delivery-store-logo img')).toHaveAttribute(
      'src',
      'https://cdn.example.com/logo.png'
    );
  });

  it('usa iniciais quando não há logo', () => {
    render(
      <DeliveryStoreHeader
        catalog={{
          storeName: 'Padaria Belas',
          open: false,
        }}
      />
    );
    expect(screen.getByText('PB')).toBeInTheDocument();
  });
});
