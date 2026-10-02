import { expect, Page, test } from './fixtures';
import { brokenImages, collectErrors, horizontalOverflow, VIEWPORTS } from './support';

test.describe('admission information', () => {
  for (const lang of ['bn', 'en'] as const) {
    test(`overview renders real and pending content in ${lang}`, async ({ page }) => {
      const errors = collectErrors(page);
      await page.goto(`/${lang}/admission`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
      await expect(page.locator('img[src*="admission-2026"]')).toBeVisible();
      expect(await brokenImages(page)).toEqual([]);
      await expect(page.locator('main app-pending-note')).toHaveCount(3);
      const calendar = page.getByRole('table');
      await expect(calendar.getByRole('columnheader')).toHaveCount(2);
      await expect(calendar.getByRole('row')).toHaveCount(5);
      await expect(page.locator('main a[href="tel:01678708862"]')).toBeVisible();
      expect(errors).toEqual([]);
    });
  }

  test('notice image opens in the lightbox and closes with Escape', async ({ page }) => {
    await page.goto('/en/admission');
    const open = page.getByRole('button', { name: /View larger image: Admission notice 2026/ });
    await open.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('img', { name: 'Admission notice 2026' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
  });

  for (const width of VIEWPORTS) {
    test(`admission pages fit at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of [
        '/bn/admission',
        '/en/admission',
        '/bn/admission/apply',
        '/en/admission/apply',
      ]) {
        await page.goto(path);
        expect(await horizontalOverflow(page), `${path} at ${width}px`).toBeLessThanOrEqual(0);
      }
    });
  }
});

/** The focusable step heading inside the form area (the footer has its own h2s). */
const stepHeading = (page: Page) => page.locator('main h2[tabindex="-1"]');

async function fillStudent(page: Page) {
  await page.getByLabel('Student’s full name').fill('Test Student');
  await page.getByLabel('Date of birth').fill('2015-03-04');
  await page.getByLabel('Gender').selectOption('female');
}

async function fillGuardian(page: Page, phone = '01711732486') {
  await page.getByLabel('Guardian’s name').fill('Test Guardian');
  await page.getByLabel('Relationship to the student').selectOption('mother');
  await page.getByLabel('Mobile number').fill(phone);
  await page.getByLabel('Address').fill('Some road, Dhaka');
}

test.describe('application form prototype', () => {
  test('is labelled as a prototype and walks through all steps to a confirmation', async ({
    page,
  }) => {
    const errors = collectErrors(page);
    await page.goto('/en/admission/apply');
    await expect(page.getByText('No application is submitted from this form')).toBeVisible();
    await expect(stepHeading(page)).toContainText('Step 1 of 5');

    await fillStudent(page);
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect(stepHeading(page)).toContainText('Step 2 of 5');
    await expect(stepHeading(page)).toBeFocused();

    await fillGuardian(page);
    await page.getByRole('button', { name: 'Next step' }).click();

    await page.getByLabel('Class you are applying for').selectOption('nine');
    await page.getByLabel('Group').selectOption('business');
    await page.getByLabel('Medium').selectOption('english');
    await page.getByRole('button', { name: 'Next step' }).click();

    await expect(stepHeading(page)).toContainText('Documents');
    await page.getByLabel(/I understand this is a prototype/).check();
    await page.getByRole('button', { name: 'Next step' }).click();

    await expect(stepHeading(page)).toContainText('Review');
    const main = page.locator('main');
    for (const text of [
      'Test Student',
      'Girl',
      'Test Guardian',
      'Mother',
      'Class Nine',
      'Business Studies',
      'English version',
    ]) {
      await expect(main.getByText(text, { exact: true }).first()).toBeVisible();
    }
    await page.getByRole('button', { name: 'Finish form (prototype)' }).click();
    await expect(stepHeading(page)).toContainText('Finished (prototype)');
    await expect(page.getByText('No information was sent or saved')).toBeVisible();
    expect(errors).toEqual([]);

    await page.getByRole('button', { name: 'Start over' }).click();
    await expect(stepHeading(page)).toContainText('Step 1 of 5');
    await expect(page.getByLabel('Student’s full name')).toHaveValue('');
  });

  test('empty step: focus moves to an error summary whose links reach each field', async ({
    page,
  }) => {
    await page.goto('/en/admission/apply');
    await page.getByRole('button', { name: 'Next step' }).click();
    const summary = page.getByRole('alert').filter({ hasText: 'Please fix the following errors' });
    await expect(summary).toBeFocused();
    await expect(summary.getByRole('link')).toHaveCount(3);

    const name = page.getByLabel('Student’s full name');
    await expect(name).toHaveAttribute('aria-invalid', 'true');
    await expect(name).toHaveAttribute('aria-required', 'true');
    await expect(name).toHaveAccessibleDescription(/This information is required/);

    await summary.getByRole('link', { name: /Student’s full name/ }).click();
    await expect(name).toBeFocused();

    await name.fill('Test Student');
    await expect(name).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#apply-student-fullName-error')).toHaveCount(0);
  });

  test('field validation: bad phone, future birth date, invalid e-mail', async ({ page }) => {
    await page.goto('/en/admission/apply');
    await fillStudent(page);
    await page.getByLabel('Date of birth').fill('2999-01-01');
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect(page.getByRole('alert')).toContainText('The date cannot be in the future');
    await page.getByLabel('Date of birth').fill('2015-03-04');
    await page.getByRole('button', { name: 'Next step' }).click();

    await fillGuardian(page, '12345');
    await page.getByLabel('E-mail (optional)').fill('nope');
    await page.getByRole('button', { name: 'Next step' }).click();
    const errors = page.getByRole('alert').filter({ hasText: 'Please fix' });
    await expect(errors).toContainText('Enter a valid mobile number');
    await expect(errors).toContainText('Enter a valid e-mail address');

    await page.getByLabel('Mobile number').fill('০১৭১১৭৩২৪৮৬');
    await page.getByLabel('E-mail (optional)').fill('');
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect(stepHeading(page)).toContainText('Step 3 of 5');
  });

  test('Class Nine and Ten need a group, other classes do not show one', async ({ page }) => {
    await page.goto('/en/admission/apply');
    await fillStudent(page);
    await page.getByRole('button', { name: 'Next step' }).click();
    await fillGuardian(page);
    await page.getByRole('button', { name: 'Next step' }).click();

    await page.getByLabel('Class you are applying for').selectOption('five');
    await expect(page.getByLabel('Group')).toHaveCount(0);
    await page.getByLabel('Class you are applying for').selectOption('ten');
    await expect(page.getByLabel('Group')).toBeVisible();
    await page.getByLabel('Medium').selectOption('bangla');
    await page.getByRole('button', { name: 'Next step' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Group' })).toBeVisible();
  });

  test('back and edit keep the answers', async ({ page }) => {
    await page.goto('/en/admission/apply');
    await fillStudent(page);
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.getByRole('button', { name: 'Previous step' }).click();
    await expect(page.getByLabel('Student’s full name')).toHaveValue('Test Student');
  });

  test('sends nothing, stores nothing and logs nothing', async ({ page }) => {
    const requests: string[] = [];
    const logs: string[] = [];
    page.on('request', (request) => {
      const url = new URL(request.url());
      if (
        request.method() !== 'GET' ||
        (url.hostname !== 'localhost' && !/fonts\./.test(url.hostname))
      )
        requests.push(`${request.method()} ${request.url()}`);
    });
    page.on('console', (msg) => logs.push(msg.text()));
    await page.goto('/en/admission/apply');
    const before = requests.length;
    await page.getByLabel('Student’s full name').fill('Secret Student Name');
    await page.getByLabel('Date of birth').fill('2015-03-04');
    await page.getByLabel('Gender').selectOption('male');
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.getByLabel('Guardian’s name').fill('Secret Guardian');
    await page.getByLabel('Relationship to the student').selectOption('father');
    await page.getByLabel('Mobile number').fill('01711732486');
    await page.getByLabel('Address').fill('Secret address, Dhaka');
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.getByLabel('Class you are applying for').selectOption('five');
    await page.getByLabel('Medium').selectOption('bangla');
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.getByLabel(/I understand this is a prototype/).check();
    await page.getByRole('button', { name: 'Next step' }).click();
    await page.getByRole('button', { name: 'Finish form (prototype)' }).click();
    await expect(page.getByText('No information was sent or saved')).toBeVisible();

    expect(requests.slice(before)).toEqual([]);
    expect(logs.join('\n')).not.toMatch(/Secret|01711732486/);
    const storage = await page.evaluate(() => ({
      local: Object.keys(localStorage).filter((k) => !k.startsWith('bqes:announcement')),
      session: Object.keys(sessionStorage).filter((k) => !k.startsWith('bqes:announcement')),
      cookies: document.cookie,
    }));
    expect(storage).toEqual({ local: [], session: [], cookies: '' });
  });

  test('is fully usable with the keyboard on the Bangla page, including Bangla digits', async ({
    page,
  }) => {
    await page.goto('/bn/admission/apply');
    await expect(stepHeading(page)).toContainText('ধাপ ১ / ৫');
    await page.getByLabel(/শিক্ষার্থীর পূর্ণ নাম/).fill('টেস্ট শিক্ষার্থী');
    await page.getByLabel(/জন্ম তারিখ/).fill('2015-03-04');
    await page.getByLabel(/লিঙ্গ/).selectOption('male');
    // Enter inside a text field submits the step (a <select> does not).
    await page.getByLabel(/শিক্ষার্থীর পূর্ণ নাম/).press('Enter');
    await expect(stepHeading(page)).toContainText('ধাপ ২ / ৫');
    await page.getByLabel(/অভিভাবকের নাম/).fill('টেস্ট অভিভাবক');
    await page.getByLabel(/শিক্ষার্থীর সঙ্গে সম্পর্ক/).selectOption('father');
    await page.getByLabel(/মোবাইল নম্বর/).fill('০১৭১১৭৩২৪৮৬');
    await page.getByLabel(/ঠিকানা/).fill('বনশ্রী, ঢাকা');
    await page.getByLabel(/ঠিকানা/).press('Tab');
    await page.getByRole('button', { name: 'পরের ধাপ' }).press('Enter');
    await expect(stepHeading(page)).toContainText('ধাপ ৩ / ৫');
  });
});
