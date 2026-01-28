import { render, screen } from '../../test-utils';
import { QuoteCard } from '@/components/dashboard/QuoteCard';
import { mockQuote } from '../../test-utils';

describe('QuoteCard', () => {
  const defaultQuote = mockQuote();

  it('renders quote information correctly', () => {
    render(<QuoteCard quote={defaultQuote} />);
    
    expect(screen.getByText(/Dólar Blue/i)).toBeInTheDocument();
  });

  it('displays buy and sell values', () => {
    render(<QuoteCard quote={defaultQuote} />);
    
    expect(screen.getByText(/Buy/i)).toBeInTheDocument();
  });

  it('shows positive variation with correct styling', () => {
    const quote = mockQuote({ variation: 2.5 });
    render(<QuoteCard quote={quote} />);
    
    expect(screen.getByText(/2\.50/)).toBeInTheDocument();
  });

  it('shows negative variation with correct styling', () => {
    const quote = mockQuote({ variation: -1.5 });
    render(<QuoteCard quote={quote} />);
    
    expect(screen.getByText(/1\.50/)).toBeInTheDocument();
  });

  it('displays spread information', () => {
    const quote = mockQuote({ spread: 50 });
    render(<QuoteCard quote={quote} />);
    
    expect(screen.getByText(/Spread/i)).toBeInTheDocument();
  });

  it('handles different quote types', () => {
    const officialQuote = mockQuote({
      type: 'OFFICIAL',
      name: 'Dólar Oficial',
    });
    render(<QuoteCard quote={officialQuote} />);
    
    expect(screen.getByText(/Dólar Oficial/i)).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const quote = mockQuote({
      buy: 0,
      sell: 0,
      variation: 0,
    });
    render(<QuoteCard quote={quote} />);
    
    expect(screen.getByText(/Dólar Blue/i)).toBeInTheDocument();
  });
});
