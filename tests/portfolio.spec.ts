import { expect, test } from '@playwright/test';

test('routes, keyboard expansion, destinations, and browser history', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('I build.I question.I build better.');
  await expect(page.getByRole('link', { name: 'About me', exact: true })).toHaveAttribute('aria-current', 'page');
  const entry = page.locator('.entry').first();
  await entry.locator('summary').focus();
  await page.keyboard.press('Enter');
  await expect(entry).toHaveAttribute('open', '');
  await expect(entry).toContainText('390+ production PRs');
  await page.keyboard.press('Enter');
  await expect(entry).not.toHaveAttribute('open', '');
  await page.getByRole('link', { name: 'Contact me', exact: true }).click();
  await expect(page).toHaveURL('/contact');
  await expect(page.getByRole('link', { name: 'Contact me', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Let’s talk.');
  await expect(page.getByRole('link', { name: /Connect on LinkedIn/ })).toHaveAttribute('href', 'https://www.linkedin.com/in/nivedan-ravisha-4b4564239/');
  await expect(page.getByRole('link', { name: /Email nivedan/ })).toHaveAttribute('href', 'mailto:nivedanbr18@gmail.com');
  await expect(page.getByRole('link', { name: /View résumé/ })).toHaveAttribute('target', '_blank');
  const pdf = await request.get('/resume.pdf');
  expect(pdf.ok()).toBeTruthy();
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  await page.goBack();
  await expect(page).toHaveURL('/');
  expect(errors).toEqual([]);
});

test('unconfigured voice does not capture microphone and native booking stays honest', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { micCalls: number }).micCalls = 0;
    if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => {
      (window as unknown as { micCalls: number }).micCalls++;
      throw new DOMException('Denied', 'NotAllowedError');
    };
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Let’s talk', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Voice chat isn’t available just yet');
  expect(await page.evaluate(() => (window as unknown as { micCalls: number }).micCalls)).toBe(0);
  await page.goto('/contact');
  await expect(page.locator('.native-booking')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(page.locator('.calendar-time-options button')).toHaveCount(0);
});

test('head follows gently, returns to neutral, and respects reduced motion', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  const head = page.locator('.simba-head');
  await page.mouse.move(1400, 200);
  await expect.poll(() => head.evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
  const baseBefore = await page.locator('.portrait-base').evaluate(el => getComputedStyle(el).transform);
  expect(baseBefore).toBe('none');
  await page.evaluate(() => document.documentElement.dispatchEvent(new PointerEvent('pointerleave')));
  await expect.poll(() => head.evaluate(el => {
    const matrix = new DOMMatrix(getComputedStyle(el).transform);
    return Math.abs(matrix.b) + Math.abs(matrix.e) + Math.abs(matrix.f);
  })).toBeLessThan(.05);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.mouse.move(10, 400);
  await expect(head).toHaveCSS('transform', 'none');
});

for (const width of [360, 390, 768, 1440]) {
  test(`both pages fit ${width}px and all images load`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    for (const route of ['/', '/contact']) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, `${route} overflows at ${width}px`).toBe(false);
      for (const image of await page.locator('img').all()) {
        await expect.poll(() => image.evaluate(el => (el as HTMLImageElement).complete && (el as HTMLImageElement).naturalWidth > 0)).toBeTruthy();
      }
    }
  });
}
