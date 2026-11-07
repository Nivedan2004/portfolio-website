import { expect, test } from '@playwright/test';
import { installBuiltApp } from './fixtures/built-app';
test.use({timezoneId:'America/Los_Angeles'});
const slots=[{start:'2026-11-09T17:00:00.000Z',end:'2026-11-09T18:00:00.000Z'},{start:'2026-11-09T18:00:00.000Z',end:'2026-11-09T19:00:00.000Z'}];
test.beforeEach(async({page})=>{await page.clock.install({time:new Date('2026-11-07T18:00:00Z')});});
test('native calendar shows honest disconnected state without invented slots or provider UI',async({page})=>{
 await installBuiltApp(page);await page.goto('/contact');
 await expect(page.getByRole('status')).toContainText('Live availability isn’t connected yet');
 await expect(page.locator('iframe')).toHaveCount(0);
 await expect(page.locator('.calendar-time-options button')).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Continue',exact:true})).toHaveCount(0);
 await page.getByRole('button',{name:'Monday, November 9, 2026',exact:true}).click();
 await expect(page.locator('.calendar-times h3')).toHaveText('Monday, November 9');
 await expect(page.getByText(/\$|Powered by Google|No title/)).toHaveCount(0);
 for(const width of [360,390,768,1440]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
});
test('real-slot-shaped API responses drive selection, details and provider-confirmed success',async({page})=>{
 let submitted:Record<string,string>|undefined;
 await installBuiltApp(page,{availability:()=>({configured:true,slots,duration:60}),book:data=>{submitted=data as Record<string,string>;return{body:{status:'confirmed',...slots[0]}};}});
 await page.goto('/contact');await expect(page.locator('.native-booking-heading')).toContainText('60 min');
 await page.getByRole('button',{name:'Monday, November 9, 2026',exact:true}).click();
 await page.getByRole('button',{name:'9:00 AM',exact:true}).click();
 await page.getByRole('button',{name:'Continue',exact:true}).click();
 await expect(page.getByText('You’re booked.')).toHaveCount(0);
 await page.getByLabel('Your name', {exact:true}).fill('Test Visitor');await page.getByLabel('Email address',{exact:true}).fill('visitor@example.com');
 await page.getByRole('button',{name:'Confirm booking',exact:true}).click();
 await expect(page.getByText('You’re booked.')).toBeVisible();
 expect(submitted?.start).toBe(slots[0].start);expect(submitted?.email).toBe('visitor@example.com');expect(submitted?.requestId).toMatch(/^[\da-f-]{36}$/i);
});
test('a slot conflict returns to times without a false confirmation',async({page})=>{
 await installBuiltApp(page,{availability:()=>({configured:true,slots,duration:60}),book:()=>({status:409,body:{message:'That time has just been reserved. Please choose another.'}})});
 await page.goto('/contact');await expect(page.locator('.native-booking-heading')).toContainText('60 min');
 await page.getByRole('button',{name:'Monday, November 9, 2026',exact:true}).click();await page.getByRole('button',{name:'9:00 AM',exact:true}).click();await page.getByRole('button',{name:'Continue',exact:true}).click();
 await page.getByLabel('Your name',{exact:true}).fill('Test Visitor');await page.getByLabel('Email address',{exact:true}).fill('visitor@example.com');await page.getByRole('button',{name:'Confirm booking',exact:true}).click();
 await expect(page.locator('.native-booking').getByRole('alert')).toContainText('That time has just been reserved');await expect(page.getByText('You’re booked.')).toHaveCount(0);await expect(page.getByRole('button',{name:'9:00 AM',exact:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'10:00 AM',exact:true})).toBeVisible();
});
test('timezone changes refetch actual instants and 24-hour mode changes only presentation',async({page})=>{
 const requests:string[]=[];
 await installBuiltApp(page,{availability:url=>{requests.push(url.searchParams.get('timezone')||'');return{configured:true,slots,duration:60}}});await page.goto('/contact');await expect(page.locator('.native-booking-heading')).toContainText('60 min');
 await page.getByRole('button',{name:'Monday, November 9, 2026',exact:true}).click();await page.getByRole('button',{name:'24h',exact:true}).click();await expect(page.getByRole('button',{name:'09:00',exact:true})).toBeVisible();
 await page.getByLabel('Timezone',{exact:true}).selectOption('America/New_York');await expect(page.getByRole('button',{name:'12:00',exact:true})).toBeVisible();expect(requests).toContain('America/New_York');
});
