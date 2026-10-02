import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { CLASSES } from './classes.data';
import { FACILITIES } from './facilities.data';
import { FAQS } from './faqs.data';
import { GALLERY } from './gallery.data';
import { LEADER_MESSAGES } from './leadership.data';
import { NOTICES } from './notices.data';
import { SCHOOL_INFO } from './school-info.data';
import { TEACHERS } from './teachers.data';
import { VIDEOS } from './videos.data';

const PUBLIC_DIR = join(process.cwd(), 'public');

describe('school content data', () => {
  it('references only image files that exist in public/', () => {
    const sources = [
      SCHOOL_INFO.logo.src,
      ...GALLERY.map((g) => g.image.src),
      ...LEADER_MESSAGES.map((m) => m.photo.src),
      ...NOTICES.flatMap((n) => n.attachments.map((a) => a.src)),
    ];
    const missing = sources.filter((src) => !existsSync(join(PUBLIC_DIR, src)));
    expect(missing).toEqual([]);
  });

  it('gives every gallery photo non-empty alt text in both languages and real dimensions', () => {
    for (const { image } of GALLERY) {
      expect(image.alt.bn.trim().length).toBeGreaterThan(5);
      expect(image.alt.en?.trim().length).toBeGreaterThan(5);
      expect(image.width).toBeGreaterThan(0);
      expect(image.height).toBeGreaterThan(0);
      expect(image.isDemo).toBeFalsy();
    }
  });

  it('keeps staff slugs unique and drops private fields', () => {
    const slugs = TEACHERS.map((t) => t.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(TEACHERS.every((t) => t.photo === null)).toBe(true);
  });

  it('writes Bangla text in Bangla script', () => {
    const bangla = /[ঀ-৿]/;
    expect(CLASSES.every((c) => bangla.test(c.name.bn))).toBe(true);
    expect(FACILITIES.every((f) => bangla.test(f.title.bn) && bangla.test(f.description.bn))).toBe(
      true,
    );
    expect(FAQS.every((f) => bangla.test(f.question.bn) && bangla.test(f.answer.bn))).toBe(true);
    expect(NOTICES.every((n) => bangla.test(n.title.bn))).toBe(true);
  });

  it('has an English text for every published item that is shown on English pages', () => {
    expect(FACILITIES.every((f) => f.title.en && f.description.en)).toBe(true);
    expect(FAQS.every((f) => f.question.en && f.answer.en)).toBe(true);
    expect(CLASSES.every((c) => c.name.en)).toBe(true);
    expect(LEADER_MESSAGES.every((m) => m.paragraphs.en?.length === m.paragraphs.bn.length)).toBe(
      true,
    );
  });

  it('records the contact details transcribed from the admission banner', () => {
    expect(SCHOOL_INFO.phones).toEqual(['01678708862', '01711732486']);
    expect(SCHOOL_INFO.eiin).toBe('134172');
    expect(SCHOOL_INFO.schoolCode).toBe('424256');
    expect(SCHOOL_INFO.address?.en).toContain('South Banasree');
    // Not published anywhere: must stay empty rather than invented.
    expect(SCHOOL_INFO.emails).toEqual([]);
    expect(SCHOOL_INFO.officeHours).toBeNull();
  });

  it('uses a valid YouTube id for the published video', () => {
    expect(VIDEOS).toHaveLength(1);
    expect(VIDEOS[0].youtubeId).toBe('aPdUbVyfpSU');
    expect(VIDEOS[0].youtubeId).toMatch(/^[\w-]{11}$/);
  });
});
