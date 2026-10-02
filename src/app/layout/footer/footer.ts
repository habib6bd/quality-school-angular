import { Component, input } from '@angular/core';
import { Lang } from '../../core/i18n/lang';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="bg-secondary-950 py-8 text-sm text-secondary-100">
      <p class="container-page">
        © {{ year }}
        {{
          lang() === 'bn' ? 'বনশ্রী কোয়ালিটি এডুকেশন স্কুল' : 'Banasree Quality Education School'
        }}
      </p>
    </footer>
  `,
})
export class Footer {
  readonly lang = input.required<Lang>();
  protected readonly year = new Date().getFullYear();
}
