import { render, screen } from '@testing-library/react';
import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  SkeletonButton,
  SkeletonInput,
  SkeletonAvatar,
} from '@/components/ui/skeleton';
import {
  DolarCardSkeleton,
  DolarCardsGridSkeleton,
  BrechaGaugeSkeleton,
  ReservasWidgetSkeleton,
  ChartSkeleton,
  TableSkeleton,
  KpiCardSkeleton,
  KpiCardsGridSkeleton,
  FormSkeleton,
  DashboardSkeleton,
  CotizacionesPageSkeleton,
  CalculadoraPageSkeleton,
  ArbitrajeListSkeleton,
} from '@/components/skeletons';

describe('Skeleton UI Components', () => {
  describe('Skeleton', () => {
    it('renders with default classes', () => {
      render(<Skeleton data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('animate-pulse');
      expect(skeleton).toHaveClass('bg-gray-800/50');
    });

    it('accepts custom className', () => {
      render(<Skeleton className="h-10 w-full" data-testid="skeleton" />);
      const skeleton = screen.getByTestId('skeleton');
      expect(skeleton).toHaveClass('h-10');
      expect(skeleton).toHaveClass('w-full');
    });
  });

  describe('SkeletonText', () => {
    it('renders single line by default', () => {
      const { container } = render(<SkeletonText />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(1);
    });

    it('renders multiple lines', () => {
      const { container } = render(<SkeletonText lines={3} />);
      const skeletons = container.querySelectorAll('.animate-pulse');
      expect(skeletons).toHaveLength(3);
    });
  });

  describe('SkeletonCircle', () => {
    it('renders with medium size by default', () => {
      render(<SkeletonCircle data-testid="circle" />);
      // Just check it renders
      expect(document.querySelector('.rounded-full')).toBeInTheDocument();
    });

    it('renders different sizes', () => {
      const { rerender } = render(<SkeletonCircle size="sm" />);
      expect(document.querySelector('.h-8')).toBeInTheDocument();

      rerender(<SkeletonCircle size="lg" />);
      expect(document.querySelector('.h-16')).toBeInTheDocument();
    });
  });

  describe('SkeletonButton', () => {
    it('renders button-like skeleton', () => {
      render(<SkeletonButton />);
      expect(document.querySelector('.h-10')).toBeInTheDocument();
    });
  });

  describe('SkeletonInput', () => {
    it('renders input-like skeleton', () => {
      render(<SkeletonInput />);
      expect(document.querySelector('.h-10')).toBeInTheDocument();
      expect(document.querySelector('.w-full')).toBeInTheDocument();
    });
  });

  describe('SkeletonAvatar', () => {
    it('renders avatar skeleton', () => {
      render(<SkeletonAvatar />);
      expect(document.querySelector('.rounded-full')).toBeInTheDocument();
    });
  });
});

describe('Page Skeletons', () => {
  describe('DolarCardSkeleton', () => {
    it('renders without errors', () => {
      render(<DolarCardSkeleton />);
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });
  });

  describe('DolarCardsGridSkeleton', () => {
    it('renders default 7 skeletons', () => {
      const { container } = render(<DolarCardsGridSkeleton />);
      // Each DolarCardSkeleton has multiple skeleton elements
      expect(container.querySelectorAll('.bg-card').length).toBe(7);
    });

    it('renders custom count', () => {
      const { container } = render(<DolarCardsGridSkeleton count={3} />);
      expect(container.querySelectorAll('.bg-card').length).toBe(3);
    });
  });

  describe('BrechaGaugeSkeleton', () => {
    it('renders without errors', () => {
      render(<BrechaGaugeSkeleton />);
      expect(document.querySelector('.bg-card')).toBeInTheDocument();
    });
  });

  describe('ReservasWidgetSkeleton', () => {
    it('renders without errors', () => {
      render(<ReservasWidgetSkeleton />);
      expect(document.querySelector('.bg-card')).toBeInTheDocument();
    });
  });

  describe('ChartSkeleton', () => {
    it('renders with default height', () => {
      render(<ChartSkeleton />);
      expect(document.querySelector('.bg-card')).toBeInTheDocument();
    });

    it('renders with custom height', () => {
      render(<ChartSkeleton height={400} />);
      const skeleton = document.querySelector('[style*="height"]');
      expect(skeleton).toBeInTheDocument();
    });
  });

  describe('TableSkeleton', () => {
    it('renders with default 5 rows', () => {
      const { container } = render(<TableSkeleton />);
      // Header + 5 rows
      expect(container.querySelectorAll('.flex.gap-4').length).toBeGreaterThanOrEqual(5);
    });

    it('renders with custom row count', () => {
      const { container } = render(<TableSkeleton rows={3} />);
      expect(container.querySelectorAll('.py-2').length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('KpiCardSkeleton', () => {
    it('renders without errors', () => {
      render(<KpiCardSkeleton />);
      expect(document.querySelector('.bg-card')).toBeInTheDocument();
    });
  });

  describe('KpiCardsGridSkeleton', () => {
    it('renders default 4 cards', () => {
      const { container } = render(<KpiCardsGridSkeleton />);
      expect(container.querySelectorAll('.bg-card').length).toBe(4);
    });

    it('renders custom count', () => {
      const { container } = render(<KpiCardsGridSkeleton count={2} />);
      expect(container.querySelectorAll('.bg-card').length).toBe(2);
    });
  });

  describe('FormSkeleton', () => {
    it('renders without errors', () => {
      render(<FormSkeleton />);
      expect(document.querySelector('.bg-card')).toBeInTheDocument();
    });
  });

  describe('DashboardSkeleton', () => {
    it('renders complete dashboard skeleton', () => {
      render(<DashboardSkeleton />);
      expect(document.querySelector('.space-y-6')).toBeInTheDocument();
      // Should have multiple cards
      expect(document.querySelectorAll('.bg-card').length).toBeGreaterThan(5);
    });
  });

  describe('CotizacionesPageSkeleton', () => {
    it('renders complete cotizaciones page skeleton', () => {
      render(<CotizacionesPageSkeleton />);
      expect(document.querySelector('.space-y-6')).toBeInTheDocument();
    });
  });

  describe('CalculadoraPageSkeleton', () => {
    it('renders complete calculadora page skeleton', () => {
      render(<CalculadoraPageSkeleton />);
      expect(document.querySelector('.space-y-6')).toBeInTheDocument();
    });
  });

  describe('ArbitrajeListSkeleton', () => {
    it('renders list of arbitraje skeletons', () => {
      const { container } = render(<ArbitrajeListSkeleton />);
      expect(container.querySelectorAll('.bg-card').length).toBe(3);
    });
  });
});
