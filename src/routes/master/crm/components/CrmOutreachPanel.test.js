import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CrmOutreachPanel } from './CrmOutreachPanel';
import { outreachApi } from '../outreachApi';

jest.mock('../outreachApi', () => ({
  outreachApi: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const status = {
  leadsFound: 10,
  leadsEligible: 4,
  messagesScheduled: 2,
  messagesSent: 1,
  failures: 0,
  replies: 0,
  interested: 1,
  conversions: 0,
  providerId: 'disabled',
  dispatchActive: false,
  paused: true,
  authPaused: false,
};

test('mostra métricas e dispara controles sem envio real', async () => {
  outreachApi.get.mockResolvedValue({ data: status });
  outreachApi.post.mockResolvedValue({
    data: { ...status, paused: false, enqueued: 3 },
  });
  render(<CrmOutreachPanel />);
  await waitFor(() => expect(screen.getByText('Elegíveis')).toBeInTheDocument());
  expect(screen.getByText('4')).toBeInTheDocument();
  expect(screen.getByText(/disparo desativado/i)).toBeInTheDocument();

  await userEvent.click(screen.getByRole('button', { name: 'Enfileirar elegíveis' }));
  await waitFor(() => expect(outreachApi.post).toHaveBeenCalledWith('/enqueue?limit=20'));
  await waitFor(() => expect(screen.getByText(/3 contato/i)).toBeInTheDocument());
});
