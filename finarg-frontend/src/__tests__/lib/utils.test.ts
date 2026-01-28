import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('merges class names correctly', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      const result = cn('base', true && 'included', false && 'excluded');
      expect(result).toBe('base included');
    });

    it('handles undefined and null values', () => {
      const result = cn('base', undefined, null, 'other');
      expect(result).toBe('base other');
    });

    it('merges Tailwind classes correctly', () => {
      // tailwind-merge should keep the last conflicting class
      const result = cn('p-4', 'p-2');
      expect(result).toBe('p-2');
    });

    it('handles object syntax', () => {
      const result = cn({
        'class-a': true,
        'class-b': false,
        'class-c': true,
      });
      expect(result).toBe('class-a class-c');
    });

    it('handles array syntax', () => {
      const result = cn(['class-a', 'class-b']);
      expect(result).toBe('class-a class-b');
    });

    it('handles mixed syntax', () => {
      const result = cn(
        'base',
        ['array-class'],
        { 'object-class': true },
        true && 'conditional'
      );
      expect(result).toContain('base');
      expect(result).toContain('array-class');
      expect(result).toContain('object-class');
      expect(result).toContain('conditional');
    });

    it('returns empty string for no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('handles Tailwind color conflicts', () => {
      const result = cn('text-red-500', 'text-blue-500');
      expect(result).toBe('text-blue-500');
    });

    it('handles Tailwind spacing conflicts', () => {
      const result = cn('mt-2', 'mt-4');
      expect(result).toBe('mt-4');
    });

    it('does not merge non-conflicting classes', () => {
      const result = cn('text-lg', 'font-bold', 'text-center');
      expect(result).toBe('text-lg font-bold text-center');
    });
  });
});
