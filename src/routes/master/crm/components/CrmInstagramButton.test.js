import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CrmInstagramButton } from './CrmInstagramButton';
import { prepareCrmInstagram, recordCrmInstagramEvent, confirmCrmInstagramSend } from '../service/crmService';

jest.mock('../service/crmService', () => ({
  prepareCrmInstagram: jest.fn(),
  recordCrmInstagramEvent: jest.fn(),
  confirmCrmInstagramSend: jest.fn(),
  registerCrmInstagramResponse: jest.fn(),
  scheduleCrmInstagramFollowUp: jest.fn(),
}));

describe('CrmInstagramButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    prepareCrmInstagram.mockResolvedValue({
      data: {
        leadKind: 'ESTABLISHMENT',
        leadKindLabel: 'Estabelecimento',
        username: 'cabanaburger',
        message: 'Olá! Somos a Weper.',
        directUrl: 'https://ig.me/m/cabanaburger',
        profileUrl: 'https://www.instagram.com/cabanaburger/',
        outreachStatus: 'PREPARED',
        outreachStatusLabel: 'Mensagem preparada',
        directHint: 'O link do Direct não leva o texto.',
      },
    });
    recordCrmInstagramEvent.mockResolvedValue({ data: { id: 4, instagramOutreachStatus: 'OPENED' } });
    confirmCrmInstagramSend.mockResolvedValue({ data: { id: 4, instagramOutreachStatus: 'SENT' } });
  });

  it('só aparece quando há Instagram válido', () => {
    const { rerender } = render(<CrmInstagramButton instagram="" />);
    expect(screen.queryByRole('button', { name: 'Instagram' })).not.toBeInTheDocument();

    rerender(<CrmInstagramButton instagram="@cabanaburger" />);
    expect(screen.getByRole('button', { name: 'Instagram' })).toBeInTheDocument();
  });

  it('abre a prévia do lead e o Direct sem colocar texto na URL', async () => {
    const open = jest.spyOn(window, 'open').mockImplementation(() => ({}));
    render(<CrmInstagramButton lead={{ id: 4, instagram: '@cabanaburger', leadKind: 'ESTABLISHMENT' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'Instagram' }));

    expect(await screen.findByDisplayValue('Olá! Somos a Weper.')).toBeInTheDocument();
    expect(prepareCrmInstagram).toHaveBeenCalledWith(4);
    expect(screen.getByText('Estabelecimento')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir Direct' }));
    await waitFor(() => expect(open).toHaveBeenCalledWith(
      'https://ig.me/m/cabanaburger',
      '_blank',
      'noopener,noreferrer',
    ));
    expect(String(open.mock.calls[0][0])).not.toContain('?');
    expect(recordCrmInstagramEvent).toHaveBeenCalledWith(4, 'OPENED');
    expect(confirmCrmInstagramSend).not.toHaveBeenCalled();
    open.mockRestore();
  });
});
