import { expect, Page, test } from './fixtures';
import { collectErrors, horizontalOverflow, stubExternalHosts, VIEWPORTS } from './support';

test.describe('FAQ', () => {
  test('lists all questions; each opens and closes with the keyboard', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('/en/faq');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('FAQ');
    const triggers = page.locator('app-accordion button[aria-expanded]');
    await expect(triggers).toHaveCount(11);
    const first = triggers.first();
    await first.focus();
    await page.keyboard.press('Enter');
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('ArrowDown');
    await expect(triggers.nth(1)).toBeFocused();
    await page.keyboard.press('End');
    await expect(triggers.last()).toBeFocused();
    await first.focus();
    await page.keyboard.press('Space');
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    expect(errors).toEqual([]);
  });

  test('category chips and search filter the questions and are kept in the URL', async ({
    page,
  }) => {
    await page.goto('/en/faq');
    const nav = page.getByRole('navigation', { name: 'Browse by topic' });
    await nav.getByRole('link', { name: /^Admission/ }).click();
    await expect(page).toHaveURL(/\/en\/faq\?category=admission$/);
    await expect(page.locator('app-accordion button[aria-expanded]')).toHaveCount(2);

    const search = page.getByRole('searchbox', { name: 'Search the questions' });
    await search.fill('prototype');
    await expect(page).toHaveURL(/q=prototype/);
    await expect(page).toHaveURL(/category=admission/);
    await expect(page.locator('app-accordion button[aria-expanded]')).toHaveCount(1);
    await expect(page.getByText('Showing 1 of 11')).toBeVisible();

    await search.fill('xyzzy');
    await expect(page.getByText('No results')).toBeVisible();
    await page.getByRole('link', { name: 'Clear filters' }).click();
    await expect(page).toHaveURL(/\/en\/faq$/);
    await expect(page.locator('app-accordion button[aria-expanded]')).toHaveCount(11);
  });

  test('a filtered FAQ URL is rendered on the server', async ({ request }) => {
    const html = await (await request.get('/en/faq?category=contact')).text();
    expect(html.match(/data-accordion-trigger/g)).toHaveLength(2);
  });

  test('Bangla FAQ is searchable in Bangla', async ({ page }) => {
    await page.goto('/bn/faq');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('সাধারণ জিজ্ঞাসা');
    await page.getByRole('searchbox').fill('প্রোটোটাইপ');
    await expect(page.locator('app-accordion button[aria-expanded]').first()).toBeVisible();
    const count = await page.locator('app-accordion button[aria-expanded]').count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(11);
  });
});

test.describe('guardian reviews', () => {
  test('the homepage says honestly that no reviews are published', async ({ page }) => {
    await page.goto('/en');
    const section = page.getByRole('region', { name: 'Guardian reviews' });
    await expect(section.getByText('No reviews published yet')).toBeVisible();
    await expect(section.locator('blockquote')).toHaveCount(0);
  });
});

const fillValid = async (page: Page) => {
  await page.getByLabel('Your name').fill('Test Guardian');
  await page.getByLabel('Mobile number').fill('01711732486');
  await page.getByLabel('Your message').fill('I would like to know more about the school.');
};

test.describe('contact', () => {
  test('shows consistent details, a prototype label and the map', async ({ page }) => {
    await stubExternalHosts(page);
    const errors = collectErrors(page);
    await page.goto('/en/contact');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Contact');
    const main = page.locator('main');
    await expect(main).toContainText(
      'House K-278, Road 16 (beside Jora Khamba), South Banasree, Dhaka',
    );
    await expect(main.getByRole('link', { name: '01678708862' })).toHaveAttribute(
      'href',
      'tel:01678708862',
    );
    await expect(main.getByRole('link', { name: '01711732486' })).toHaveAttribute(
      'href',
      'tel:01711732486',
    );
    await expect(main).toContainText('Office hours: To be confirmed by the school');
    await expect(page.getByText('No message is sent from this form')).toBeVisible();
    await expect(main.locator('iframe')).toHaveAttribute(
      'src',
      /^https:\/\/maps\.google\.com\/maps\?/,
    );
    await expect(main.locator('iframe')).toHaveAttribute('title', /Google Maps/);
    // Same details in the footer on the same page.
    await expect(page.locator('footer').getByRole('link', { name: '01678708862' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('validation is accessible: summary, aria attributes, e-mail-or-phone rule', async ({
    page,
  }) => {
    await page.goto('/en/contact');
    await page.getByRole('button', { name: 'Send message (prototype)' }).click();
    const summary = page.getByRole('alert').filter({ hasText: 'Please fix the following errors' });
    await expect(summary).toBeFocused();
    await expect(summary).toContainText('Please give an e-mail address or a mobile number');
    const name = page.getByLabel('Your name');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAttribute('aria-required', 'true');
    await expect(name).toHaveAccessibleDescription(/This information is required/);

    await summary.getByRole('link', { name: /Your name/ }).click();
    await expect(name).toBeFocused();

    await name.fill('Test');
    await page.getByLabel('E-mail', { exact: false }).first().fill('nope');
    await page.getByLabel('Your message').fill('short');
    await page.getByRole('button', { name: 'Send message (prototype)' }).click();
    await expect(page.locator('#contact-email-error')).toContainText('valid e-mail');
    await expect(page.locator('#contact-message-error')).toContainText('at least 10');
  });

  test('a valid message shows the prototype success state; sends nothing, stores nothing', async ({
    page,
  }) => {
    const requests: string[] = [];
    const logs: string[] = [];
    page.on('request', (r) => {
      const url = new URL(r.url());
      if (
        r.method() !== 'GET' ||
        (!['localhost'].includes(url.hostname) && !/fonts\.|google\.com/.test(url.hostname))
      )
        requests.push(`${r.method()} ${r.url()}`);
    });
    page.on('console', (m) => logs.push(m.text()));
    await stubExternalHosts(page);
    await page.goto('/en/contact');
    const before = requests.length;
    await page.getByLabel('Your name').fill('Secret Person');
    await page.getByLabel('Mobile number').fill('01711732486');
    await page.getByLabel('Subject').selectOption('admission');
    await page.getByLabel('Your message').fill('Secret message text for the school.');
    await page.getByRole('button', { name: 'Send message (prototype)' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Prototype finished' })).toBeVisible();
    await expect(page.getByText('No message was sent or saved')).toBeVisible();
    expect(requests.slice(before)).toEqual([]);
    expect(logs.join('\n')).not.toMatch(/Secret/);
    expect(
      await page.evaluate(
        () =>
          Object.keys(localStorage).filter((k) => !k.startsWith('bqes:')).length +
          sessionStorage.length,
      ),
    ).toBe(0);

    await page.getByRole('button', { name: 'Write another message' }).click();
    await expect(page.getByLabel('Your name')).toHaveValue('');
  });

  test('Bangla contact page: labels, digits and Bangla validation messages', async ({ page }) => {
    await stubExternalHosts(page);
    await page.goto('/bn/contact');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('যোগাযোগ');
    await expect(page.locator('main')).toContainText('০১৬৭৮৭০৮৮৬২');
    await page.getByRole('button', { name: 'বার্তা পাঠান (প্রোটোটাইপ)' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: 'অনুগ্রহ করে নিচের ত্রুটিগুলো ঠিক করুন' }),
    ).toBeVisible();
  });

  test('footer, homepage and contact page agree on the phone numbers', async ({ page }) => {
    await stubExternalHosts(page);
    const collect = async (path: string) => {
      await page.goto(path);
      return page
        .locator('a[href^="tel:"]')
        .evaluateAll((links) => [...new Set(links.map((a) => a.getAttribute('href')))].sort());
    };
    const home = await collect('/en');
    const contact = await collect('/en/contact');
    expect(home).toEqual(['tel:01678708862', 'tel:01711732486']);
    expect(contact).toEqual(home);
  });
});

for (const width of VIEWPORTS) {
  test(`faq and contact fit at ${width}px`, async ({ page }) => {
    await stubExternalHosts(page);
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/bn/faq', '/en/faq?category=admission', '/bn/contact', '/en/contact']) {
      await page.goto(path);
      expect(await horizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
    }
  });
}
