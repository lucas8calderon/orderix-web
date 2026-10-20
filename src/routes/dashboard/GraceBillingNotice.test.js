import { render, screen } from '@testing-library/react';
import { GraceBillingNotice } from './GraceBillingNotice';
import { getCurrentUser } from '../../services/authService';
import { publishSubscriptionNotice } from '../../services/subscriptionNotice';

jest.mock('../../services/authService', () => ({ getCurrentUser: jest.fn() }));

beforeEach(() => {
  publishSubscriptionNotice('');
  getCurrentUser.mockReturnValue(null);
});

test('grace keeps the store operating and shows the billing notice', () => {
  getCurrentUser.mockReturnValue({ subscriptionActive: true, subscriptionStatus: 'OVERDUE' });
  render(<GraceBillingNotice />);
  expect(screen.getByRole('status')).toHaveTextContent(/loja segue operando por até 7 dias/i);
});

test('an active paid cycle shows no notice', () => {
  getCurrentUser.mockReturnValue({ subscriptionActive: true, subscriptionStatus: 'ACTIVE' });
  const { container } = render(<GraceBillingNotice />);
  expect(container).toBeEmptyDOMElement();
});

test('a live webhook notice is shown during grace', () => {
  getCurrentUser.mockReturnValue({ subscriptionActive: true, subscriptionStatus: 'ACTIVE' });
  publishSubscriptionNotice('A mensalidade venceu. O acesso segue durante a tolerância.');
  render(<GraceBillingNotice />);
  expect(screen.getByRole('status')).toHaveTextContent(/acesso segue durante a tolerância/i);
});
