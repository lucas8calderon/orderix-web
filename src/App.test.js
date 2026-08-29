import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Weper landing page', () => {
  render(<App />);
  expect(screen.getAllByText(/Weper/i).length).toBeGreaterThan(0);
});
