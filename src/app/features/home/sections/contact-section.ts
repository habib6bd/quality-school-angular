import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { SchoolInfoService } from '../../../core/services/school-info.service';
import { ContentSection } from '../../../shared/components/content-section/content-section';
import { Icon } from '../../../shared/components/icon/icon';
import { MapEmbed } from '../../../shared/components/map-embed/map-embed';
import { LocaleDigitsPipe } from '../../../shared/pipes/locale-format.pipes';
import { LocalizePipe } from '../../../shared/pipes/localize.pipe';
import { PagePathPipe } from '../../../shared/pipes/page-path.pipe';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContentSection,
    Icon,
    MapEmbed,
    LocaleDigitsPipe,
    LocalizePipe,
    PagePathPipe,
    TranslatePipe,
  ],
  template: `
    <app-content-section
      tone="white"
      [title]="'home.contactTitle' | t"
      [link]="'contact' | pagePath"
      [linkLabel]="'home.contactMore' | t"
    >
      <div class="grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
        <dl class="space-y-5">
          <div class="flex gap-4">
            <dt class="mt-0.5 text-primary-700">
              <app-icon name="mapPin" [size]="22" /><span class="sr-only">{{
                'footer.address' | t
              }}</span>
            </dt>
            <dd>
              @if (info().address; as address) {
                {{ address | localize }}
              } @else {
                {{ 'common.toBeConfirmed' | t }}
              }
            </dd>
          </div>
          <div class="flex gap-4">
            <dt class="mt-0.5 text-primary-700">
              <app-icon name="phone" [size]="22" /><span class="sr-only">{{
                'footer.phone' | t
              }}</span>
            </dt>
            <dd>
              @for (phone of info().phones; track phone) {
                <a [href]="'tel:' + phone" class="block font-medium hover:text-primary-700">{{
                  phone | localeDigits
                }}</a>
              } @empty {
                {{ 'common.toBeConfirmed' | t }}
              }
            </dd>
          </div>
          <div class="flex gap-4">
            <dt class="mt-0.5 text-primary-700">
              <app-icon name="mail" [size]="22" /><span class="sr-only">{{
                'footer.email' | t
              }}</span>
            </dt>
            <dd>
              @for (email of info().emails; track email) {
                <a [href]="'mailto:' + email" class="block break-all hover:text-primary-700">{{
                  email
                }}</a>
              } @empty {
                {{ 'common.toBeConfirmed' | t }}
              }
            </dd>
          </div>
          <div class="flex gap-4">
            <dt class="mt-0.5 text-primary-700">
              <app-icon name="clock" [size]="22" /><span class="sr-only">{{
                'contact.officeHours' | t
              }}</span>
            </dt>
            <dd>
              @if (info().officeHours; as hours) {
                {{ hours | localize }}
              } @else {
                {{ 'contact.officeHours' | t }}: {{ 'common.toBeConfirmed' | t }}
              }
            </dd>
          </div>
        </dl>
        <app-map-embed [url]="info().mapEmbedUrl" [title]="'home.mapTitle' | t" />
      </div>
    </app-content-section>
  `,
})
export class HomeContact {
  protected readonly info = inject(SchoolInfoService).info;
}
