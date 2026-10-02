import { DOCUMENT } from '@angular/common';
import { afterNextRender, ApplicationRef, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
export class App {
  constructor() {
    const appRef = inject(ApplicationRef);
    const root = inject(DOCUMENT).documentElement;
    // Browser only: marks the page as hydrated and idle, so end-to-end tests (and anyone
    // debugging) can tell when server-rendered controls have become interactive.
    afterNextRender(() => {
      void appRef.whenStable().then(() => root.setAttribute('data-app-ready', 'true'));
    });
  }
}
