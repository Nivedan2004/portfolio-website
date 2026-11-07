import { expect, test } from '@playwright/test';
import { installBuiltApp } from './fixtures/built-app';
test('experience expands independently of education, including neighboring card heights',async({page})=>{
 await installBuiltApp(page);await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/');
 const lawgical=page.locator('.entry').filter({has:page.getByRole('heading',{name:'Lawgical',exact:true})});
 const uw=page.locator('.entry').filter({has:page.getByRole('heading',{name:'University of Washington',exact:true})});
 const rv=page.locator('.entry').filter({has:page.getByRole('heading',{name:'RV University',exact:true})});
 await expect(uw).toBeVisible();await page.evaluate(()=>document.fonts.ready);const before=await uw.boundingBox();const rvBefore=await rv.evaluate(el=>el.getBoundingClientRect().top+window.scrollY);
 await lawgical.locator('summary').click();await expect(lawgical).toHaveAttribute('open','');await expect(uw).not.toHaveAttribute('open','');
 expect(Math.abs((await uw.boundingBox())!.height-before!.height)).toBeLessThan(1);
 expect(Math.abs((await rv.evaluate(el=>el.getBoundingClientRect().top+window.scrollY))-rvBefore)).toBeLessThan(1);
 await uw.locator('summary').focus();await page.keyboard.press('Enter');
 await expect(uw.getByText('Parallel Programming in Grid and Cloud',{exact:true})).toBeVisible();
 await expect(uw.getByText('Information Assurance and Cybersecurity',{exact:true})).toBeVisible();
 await expect(uw.locator('.entry-highlights')).toHaveText('Bothell, WA');await expect(uw).not.toContainText('Aug 2028');
 await expect(uw).toContainText('OpenMP and MPI');await expect(uw).toContainText('Secure development lifecycle');
 for(const width of [390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
