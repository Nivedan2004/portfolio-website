import { expect, test } from '@playwright/test';
import { installBuiltApp } from './fixtures/built-app';
test('theme toggles, persists through reload/navigation, and fits mobile', async ({page}) => {
 await page.emulateMedia({colorScheme:'dark',reducedMotion:'reduce'});
 await installBuiltApp(page); await page.goto('/');
 await page.getByRole('button',{name:'Switch to light mode'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await expect.poll(()=>page.evaluate(()=>localStorage.getItem('portfolio-theme'))).toBe('light');
 await page.reload(); await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.getByRole('link',{name:'Contact me',exact:true}).click();
 await page.waitForURL('**/contact');
 await expect(page.locator('#contact-title')).toBeVisible();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 for(const width of [320,360,390,768,1440]) {
  await page.setViewportSize({width,height:900});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const toggle=await page.locator('.theme-toggle').boundingBox();
  expect(toggle!.x+toggle!.width).toBeLessThanOrEqual(width);
 }
 await page.screenshot({path:'/tmp/portfolio-light-contact.png',fullPage:true});
 await page.getByRole('button',{name:'Switch to dark mode'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
});
test('new visitors start in dark mode even with a light system preference',async({page})=>{
 await page.emulateMedia({colorScheme:'light',reducedMotion:'reduce'});
 await installBuiltApp(page);await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
 await page.getByRole('button',{name:'Switch to light mode'}).click();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
 await page.reload();
 await expect(page.locator('html')).toHaveAttribute('data-theme','light');
});
