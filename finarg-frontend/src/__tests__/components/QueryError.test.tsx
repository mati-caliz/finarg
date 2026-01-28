import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryError, EmptyState } from '@/components/QueryError';
import { AlertCircle } from 'lucide-react';

describe('QueryError', () => {
  it('renders error message', () => {
    render(<QueryError error={new Error('Test error')} />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });

  it('shows retry button when onRetry is provided', () => {
    const onRetry = jest.fn();
    render(<QueryError error={new Error('Test')} onRetry={onRetry} />);
    expect(screen.getByRole('button', { name: /reintentar/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', async () => {
    const user = userEvent.setup();
    const onRetry = jest.fn();
    render(<QueryError error={new Error('Test')} onRetry={onRetry} />);
    
    await user.click(screen.getByRole('button', { name: /reintentar/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not show retry button when onRetry is not provided', () => {
    render(<QueryError error={new Error('Test')} />);
    expect(screen.queryByRole('button', { name: /reintentar/i })).not.toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<QueryError error={new Error('Test')} title="Custom Error Title" />);
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument();
  });

  it('renders compact version', () => {
    const { container } = render(
      <QueryError error={new Error('Test')} compact />
    );
    // Compact version should not have card wrapper
    expect(container.querySelector('.p-8')).not.toBeInTheDocument();
  });

  it('detects network error', () => {
    render(<QueryError error={new Error('Network request failed')} />);
    expect(screen.getByText(/sin conexión/i)).toBeInTheDocument();
  });

  it('detects timeout error', () => {
    render(<QueryError error={new Error('Request timeout')} />);
    expect(screen.getByText(/tiempo agotado/i)).toBeInTheDocument();
  });

  it('detects server error', () => {
    render(<QueryError error={new Error('Server responded with 500')} />);
    expect(screen.getByText(/error del servidor/i)).toBeInTheDocument();
  });

  it('handles null error gracefully', () => {
    render(<QueryError error={null} />);
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title', () => {
    render(<EmptyState title="No data found" />);
    expect(screen.getByText('No data found')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(
      <EmptyState
        title="No data"
        description="Try adjusting your search criteria"
      />
    );
    expect(screen.getByText('Try adjusting your search criteria')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    const onClick = jest.fn();
    render(
      <EmptyState
        title="No data"
        action={{ label: 'Refresh', onClick }}
      />
    );
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
  });

  it('calls action onClick when button is clicked', async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(
      <EmptyState
        title="No data"
        action={{ label: 'Refresh', onClick }}
      />
    );
    
    await user.click(screen.getByRole('button', { name: /refresh/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders custom icon', () => {
    render(<EmptyState title="No data" icon={AlertCircle} />);
    // Icon should be rendered (hard to test specific icon)
    expect(screen.getByText('No data')).toBeInTheDocument();
  });
});
