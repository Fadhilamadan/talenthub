import { cn } from './cn';

describe('cn', () => {
  it('should handle falsy values', () => {
    const result = cn('class1', false && 'class2', 'class3', null);
    expect(result).toBe('class1 class3');
  });

  it('should merge Tailwind classes', () => {
    const result = cn('bg-red-500', 'bg-blue-500', 'bg-green-500');
    expect(result).toBe('bg-green-500');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle undefined input', () => {
    const result = cn(undefined, 'class1', undefined, 'class2');
    expect(result).toBe('class1 class2');
  });
});
