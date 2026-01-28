import { render, screen } from '../../test-utils';
import { BrechaGauge } from '@/components/dashboard/BrechaGauge';
import { mockBrecha } from '../../test-utils';

describe('BrechaGauge', () => {
  it('renders brecha information', () => {
    const brecha = mockBrecha();
    render(<BrechaGauge brecha={brecha} />);
    
    // Should display brecha percentage
    expect(screen.getByText(/16\.67/)).toBeInTheDocument();
  });

  it('displays BAJA nivel correctly', () => {
    const brecha = mockBrecha({
      porcentajeBrecha: 5,
      nivel: 'BAJA',
      colorSemaforo: '#10b981',
    });
    render(<BrechaGauge brecha={brecha} />);
    
    expect(screen.getByText(/baja/i)).toBeInTheDocument();
  });

  it('displays MEDIA nivel correctly', () => {
    const brecha = mockBrecha({
      porcentajeBrecha: 20,
      nivel: 'MEDIA',
      colorSemaforo: '#f59e0b',
    });
    render(<BrechaGauge brecha={brecha} />);
    
    expect(screen.getByText(/media/i)).toBeInTheDocument();
  });

  it('displays ALTA nivel correctly', () => {
    const brecha = mockBrecha({
      porcentajeBrecha: 50,
      nivel: 'ALTA',
      colorSemaforo: '#ef4444',
    });
    render(<BrechaGauge brecha={brecha} />);
    
    expect(screen.getByText(/alta/i)).toBeInTheDocument();
  });

  it('shows both dolar values', () => {
    const brecha = mockBrecha({
      dolarOficial: 900,
      dolarBlue: 1050,
    });
    render(<BrechaGauge brecha={brecha} />);
    
    // Should show oficial and blue values
    expect(screen.getByText(/oficial/i)).toBeInTheDocument();
    expect(screen.getByText(/blue/i)).toBeInTheDocument();
  });

  it('displays description', () => {
    const brecha = mockBrecha({
      descripcion: 'Brecha moderada, monitorear',
    });
    render(<BrechaGauge brecha={brecha} />);
    
    expect(screen.getByText(/brecha moderada/i)).toBeInTheDocument();
  });

  it('handles high brecha values', () => {
    const brecha = mockBrecha({
      porcentajeBrecha: 150,
      nivel: 'ALTA',
    });
    render(<BrechaGauge brecha={brecha} />);
    
    expect(screen.getByText(/150/)).toBeInTheDocument();
  });
});
