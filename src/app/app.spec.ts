import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App routing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes)],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('redirects the root URL to the default Bangla tree', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/bn');
    expect(document.documentElement.lang).toBe('bn');
  });

  it('renders the English tree and sets the document language', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/en');
    expect(harness.routeNativeElement?.textContent).toContain('Banasree Quality Education School');
    expect(document.documentElement.lang).toBe('en');
  });

  it('renders the not-found page for unknown URLs', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/bn/does-not-exist');
    expect(harness.routeNativeElement?.textContent).toContain('404');
  });
});
