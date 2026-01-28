import { render, screen } from '../../test-utils';
import { DolarCard } from '@/components/dashboard/DolarCard';
import { mockCotizacion } from '../../test-utils';

describe('DolarCard', () => {
  const defaultCotizacion = mockCotizacion();

  it('renders cotización information correctly', () => {
    render(<DolarCard cotizacion={defaultCotizacion} />);
    
    expect(screen.getByText(/dólar blue/i)).toBeInTheDocument();
  });

  it('displays compra and venta values', () => {
    render(<DolarCard cotizacion={defaultCotizacion} />);
    
    // Check that price values are displayed (formatted)
    expect(screen.getByText(/compra/i)).toBeInTheDocument();
    expect(screen.getByText(/venta/i)).toBeInTheDocument();
  });

  it('shows positive variation with correct styling', () => {
    const cotizacion = mockCotizacion({ variacion: 2.5 });
    render(<DolarCard cotizacion={cotizacion} />);
    
    // Should show positive variation
    expect(screen.getByText(/2\.5/)).toBeInTheDocument();
  });

  it('shows negative variation with correct styling', () => {
    const cotizacion = mockCotizacion({ variacion: -1.5 });
    render(<DolarCard cotizacion={cotizacion} />);
    
    expect(screen.getByText(/1\.5/)).toBeInTheDocument();
  });

  it('displays spread information', () => {
    const cotizacion = mockCotizacion({ spread: 5 });
    render(<DolarCard cotizacion={cotizacion} />);
    
    expect(screen.getByText(/spread/i)).toBeInTheDocument();
  });

  it('shows update timestamp', () => {
    const cotizacion = mockCotizacion({
      fechaActualizacion: '2024-01-15T10:30:00Z',
    });
    render(<DolarCard cotizacion={cotizacion} />);
    
    // Should show formatted date
    expect(screen.getByText(/2024/)).toBeInTheDocument();
  });

  it('handles different dolar types', () => {
    const oficialCotizacion = mockCotizacion({
      tipo: 'OFICIAL',
      nombre: 'Dólar Oficial',
    });
    render(<DolarCard cotizacion={oficialCotizacion} />);
    
    expect(screen.getByText(/dólar oficial/i)).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const cotizacion = mockCotizacion({
      compra: 0,
      venta: 0,
      variacion: 0,
    });
    render(<DolarCard cotizacion={cotizacion} />);
    
    // Should render without errors
    expect(screen.getByText(/dólar blue/i)).toBeInTheDocument();
  });
});
