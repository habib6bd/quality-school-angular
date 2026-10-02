import { Achievement } from '../models/achievement.model';
import { CalendarEvent } from '../models/calendar.model';
import { ResourceItem } from '../models/resource.model';
import { Testimonial } from '../models/testimonial.model';

/** The school has not published any verified achievements yet, so the list is empty. */
export const ACHIEVEMENTS_DATA: readonly Achievement[] = [];

/** The academic calendar has not been published by the school, so there are no entries. */
export const CALENDAR_DATA: readonly CalendarEvent[] = [];

/** The school has not supplied any routines, syllabus, study material, forms or policies yet. */
export const RESOURCES_DATA: readonly ResourceItem[] = [];

/** No guardian review has been verified or approved for publication, so the list is empty. */
export const TESTIMONIALS_DATA: readonly Testimonial[] = [];
