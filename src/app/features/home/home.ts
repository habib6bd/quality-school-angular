import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { LanguageService } from '../../core/i18n/language.service';
import { SeoService } from '../../core/seo/seo.service';
import { schoolJsonLd } from '../../core/seo/structured-data';
import { SchoolInfoService } from '../../core/services/school-info.service';
import { HomeAbout } from './sections/about-intro';
import { HomeAchievements } from './sections/achievements-preview';
import { HomeAdmissionCta } from './sections/admission-cta';
import { HomeContact } from './sections/contact-section';
import { HomeEvents } from './sections/upcoming-events';
import { HomeFacilities } from './sections/facilities-preview';
import { HomeFaq } from './sections/faq-preview';
import { HomeGallery } from './sections/gallery-preview';
import { HomeHero } from './sections/hero';
import { HomeMessages } from './sections/leadership-messages';
import { HomeNotices } from './sections/latest-notices';
import { HomePrograms } from './sections/programs-preview';
import { HomeQuickLinks } from './sections/quick-links';
import { HomeTeachers } from './sections/teachers-preview';
import { HomeTestimonials } from './sections/testimonials-preview';
import { HomeVideos } from './sections/video-preview';
import { HomeWhyChoose } from './sections/why-choose';

/**
 * Homepage. Section order follows the plan: hero → quick links → about → why choose →
 * leadership messages → programs → teachers → facilities → notices → events → achievements →
 * gallery → videos → guardian reviews → admission CTA → FAQ → contact. The announcement bar,
 * header and footer come from the shell.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    HomeHero,
    HomeQuickLinks,
    HomeAbout,
    HomeWhyChoose,
    HomeMessages,
    HomePrograms,
    HomeTeachers,
    HomeFacilities,
    HomeNotices,
    HomeEvents,
    HomeAchievements,
    HomeGallery,
    HomeVideos,
    HomeTestimonials,
    HomeAdmissionCta,
    HomeFaq,
    HomeContact,
  ],
  template: `
    <app-home-hero />
    <app-home-quick-links />
    <app-home-about />
    <app-home-why-choose />
    <app-home-messages />
    <app-home-programs />
    <app-home-teachers />
    <app-home-facilities />
    <app-home-notices />
    <app-home-events />
    <app-home-achievements />
    <app-home-gallery />
    <app-home-videos />
    <app-home-testimonials />
    <app-home-admission-cta />
    <app-home-faq />
    <app-home-contact />
  `,
})
export class Home {
  constructor() {
    const seo = inject(SeoService);
    const info = inject(SchoolInfoService).info;
    const language = inject(LanguageService);
    // The school as structured data (name, founding year, banner address/phones, social links).
    effect(() => seo.addStructuredData('school', schoolJsonLd(info(), language.lang())));
  }
}
