import { render, screen } from '../../test-utils';
import { GapGauge } from '@/components/dashboard/GapGauge';
import { mockGap } from '../../test-utils';

describe('GapGauge', () => {
  it('renders gap information', () => {
    const gap = mockGap();
    render(<GapGauge gap={gap} />);
    
    expect(screen.getByText(/16\.7/)).toBeInTheDocument();
  });

  it('displays LOW level correctly', () => {
    const gap = mockGap({
      gapPercentage: 5,
      level: 'LOW',
      trafficLightColor: '#10b981',
    });
    render(<GapGauge gap={gap} />);
    
    expect(screen.getByText(/Low Gap/i)).toBeInTheDocument();
  });

  it('displays MEDIUM level correctly', () => {
    const gap = mockGap({
      gapPercentage: 20,
      level: 'MEDIUM',
      trafficLightColor: '#f59e0b',
    });
    render(<GapGauge gap={gap} />);
    
    expect(screen.getByText(/Medium Gap/i)).toBeInTheDocument();
  });

  it('displays HIGH level correctly', () => {
    const gap = mockGap({
      gapPercentage: 50,
      level: 'HIGH',
      trafficLightColor: '#ef4444',
    });
    render(<GapGauge gap={gap} />);
    
    expect(screen.getByText(/High Gap/i)).toBeInTheDocument();
  });

  it('shows both dollar values', () => {
    const gap = mockGap({
      officialRate: 900,
      parallelRate: 1050,
    });
    render(<GapGauge gap={gap} />);
    
    expect(screen.getByText(/Official/i)).toBeInTheDocument();
    expect(screen.getByText(/Parallel/i)).toBeInTheDocument();
  });

  it('displays description', () => {
    const gap = mockGap({
      description: 'Moderate gap, monitor closely',
    });
    render(<GapGauge gap={gap} />);
    
    expect(screen.getByText(/Moderate gap/i)).toBeInTheDocument();
  });

  it('handles high gap values', () => {
    const gap = mockGap({
      gapPercentage: 150,
      level: 'HIGH',
    });
    render(<GapGauge gap={gap} />);
    
    expect(screen.getByText(/150\.0/)).toBeInTheDocument();
  });
});
