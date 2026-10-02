import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="container-page py-24 text-center">
      <p class="text-6xl font-bold text-primary-600">404</p>
      <h1 class="mt-4 text-2xl">পৃষ্ঠাটি পাওয়া যায়নি · Page not found</h1>
      <a
        routerLink="/bn"
        class="mt-8 inline-block rounded-lg bg-primary-700 px-5 py-2.5 text-white"
      >
        হোম · Home
      </a>
    </section>
  `,
})
export class NotFound {}
