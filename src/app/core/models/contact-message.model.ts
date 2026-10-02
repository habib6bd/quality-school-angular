export type ContactSubject = 'general' | 'admission' | 'academic' | 'other';

/** What the contact form collects. It is never persisted or logged by the site. */
export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  subject: ContactSubject;
  message: string;
}
