import { render, screen } from '@testing-library/react';
import { CrmInstagramButton } from './CrmInstagramButton';

describe('CrmInstagramButton', () => {
  it('só aparece quando o estabelecimento tem Instagram', () => {
    const { rerender } = render(<CrmInstagramButton instagram="" />);
    expect(screen.queryByRole('button', { name: 'Abrir no Instagram' })).not.toBeInTheDocument();

    rerender(<CrmInstagramButton instagram="@cabanaburger" />);
    expect(screen.getByRole('button', { name: 'Abrir no Instagram' })).toBeInTheDocument();
  });
});
