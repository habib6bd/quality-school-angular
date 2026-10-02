import { Announcement } from '../models/announcement.model';
import { isActiveOn } from './announcement.service';

describe('isActiveOn', () => {
  const item: Announcement = {
    id: 'x',
    message: { bn: 'বার্তা' },
    startDate: '2026-01-01',
    endDate: '2026-01-31',
  };

  it('is inclusive of both ends of the window', () => {
    expect(isActiveOn(item, new Date('2026-01-01T12:00:00Z'))).toBe(true);
    expect(isActiveOn(item, new Date('2026-01-31T12:00:00Z'))).toBe(true);
  });

  it('is inactive outside the window', () => {
    expect(isActiveOn(item, new Date('2025-12-31T12:00:00Z'))).toBe(false);
    expect(isActiveOn(item, new Date('2026-02-01T12:00:00Z'))).toBe(false);
  });
});
