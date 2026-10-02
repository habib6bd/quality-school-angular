import { formatDate, formatNumber } from './format';

describe('locale formatting', () => {
  it('uses Bangla digits for Bangla', () => {
    expect(formatNumber(2026, 'bn', false)).toBe('২০২৬');
    expect(formatNumber(2026, 'en', false)).toBe('2026');
  });

  it('formats calendar dates without time-zone drift', () => {
    expect(formatDate('2025-11-19', 'en')).toBe('19 November 2025');
    expect(formatDate('2025-11-19', 'bn')).toBe('১৯ নভেম্বর, ২০২৫');
  });

  it('returns unparseable input unchanged', () => {
    expect(formatDate('not-a-date', 'en')).toBe('not-a-date');
  });
});

describe('formatDigits', () => {
  it('converts digits to Bangla on Bangla pages only', async () => {
    const { formatDigits } = await import('./format');
    expect(formatDigits('01678 708862', 'bn')).toBe('০১৬৭৮ ৭০৮৮৬২');
    expect(formatDigits('01678 708862', 'en')).toBe('01678 708862');
    expect(formatDigits('EIIN 134172', 'bn')).toBe('EIIN ১৩৪১৭২');
  });
});
