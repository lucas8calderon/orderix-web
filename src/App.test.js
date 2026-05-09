import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Orderix landing page', () => {
  render(<App />);
  expect(screen.getAllByText(/Orderix/i).length).toBeGreaterThan(0);
});
