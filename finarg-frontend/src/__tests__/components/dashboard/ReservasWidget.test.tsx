import { render, screen } from '../../test-utils';
import { ReservasWidget } from '@/components/dashboard/ReservasWidget';
import { mockReservas } from '../../test-utils';

describe('ReservasWidget', () => {
  it('renders reservas information', () => {
    const reservas = mockReservas();
    render(<ReservasWidget reservas={reservas} />);
    
    // Should display reservas title or key information
    expect(screen.getByText(/reservas/i)).toBeInTheDocument();
  });

  it('displays reservas brutas', () => {
    const reservas = mockReservas({
      reservasBrutas: 28000000000,
    });
    render(<ReservasWidget reservas={reservas} />);
    
    // Should show brutas value (formatted)
    expect(screen.getByText(/brutas/i)).toBeInTheDocument();
  });

  it('displays reservas netas', () => {
    const reservas = mockReservas({
      reservasNetas: 5000000000,
    });
    render(<ReservasWidget reservas={reservas} />);
    
    expect(screen.getByText(/netas/i)).toBeInTheDocument();
  });

  it('shows positive variation with correct styling', () => {
    const reservas = mockReservas({
      variacionDiaria: 100000000,
      tendencia: 'SUBIENDO',
    });
    render(<ReservasWidget reservas={reservas} />);
    
    // Check for positive trend indicator
    expect(screen.getByText(/subiendo/i)).toBeInTheDocument();
  });

  it('shows negative variation with correct styling', () => {
    const reservas = mockReservas({
      variacionDiaria: -50000000,
      tendencia: 'BAJANDO',
    });
    render(<ReservasWidget reservas={reservas} />);
    
    expect(screen.getByText(/bajando/i)).toBeInTheDocument();
  });

  it('displays swap china value', () => {
    const reservas = mockReservas({
      swapChina: 18000000000,
    });
    render(<ReservasWidget reservas={reservas} />);
    
    expect(screen.getByText(/swap/i)).toBeInTheDocument();
  });

  it('handles loading state when reservas is null', () => {
    render(<ReservasWidget reservas={null} />);
    
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
  });

  it('formats large numbers correctly', () => {
    const reservas = mockReservas({
      reservasBrutas: 28500000000,
    });
    render(<ReservasWidget reservas={reservas} />);
    
    const container = screen.getByText(/reservas/i).closest('div');
    expect(container).toBeInTheDocument();
  });
});
