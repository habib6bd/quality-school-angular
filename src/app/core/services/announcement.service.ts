import { computed, Injectable, signal } from '@angular/core';
import { ANNOUNCEMENTS } from '../data/announcements.data';
import { Announcement } from '../models/announcement.model';

export function isActiveOn(item: Announcement, date: Date): boolean {
  const day = date.toISOString().slice(0, 10);
  return item.startDate <= day && day <= item.endDate;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly all = signal<readonly Announcement[]>(ANNOUNCEMENTS);
  private readonly today = signal(new Date());

  /** The announcement to show in the site-wide bar, if any is currently active. */
  readonly current = computed(() => this.all().find((a) => isActiveOn(a, this.today())) ?? null);
}
