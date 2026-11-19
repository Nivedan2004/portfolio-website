import { expect, test } from '@playwright/test';
import { bookingStage, safeBookingError, withBookingLogging } from '../lib/booking-log';

test('provider failures expose an actionable code without credentials or personal data', async () => {
 const error = Object.assign(new Error('secret-token visitor@example.com'), {
  config: { headers: { Authorization: 'Bearer secret-token' }, data: { refresh_token: 'refresh-secret' } },
  response: { status: 400, data: { error: 'invalid_grant', error_description: 'refresh-secret' } },
 });
 const logs: string[] = [];
 const methods = ['info', 'warn', 'error'] as const;
 const original = methods.map(method => console[method]);
 methods.forEach(method => { console[method] = value => { logs.push(String(value)); }; });
 let response: Response;
 try {
  response = await withBookingLogging(new Request('https://example.test/api/booking/availability'), 'availability', async () => {
   await bookingStage('google.freebusy', async () => { throw error; });
   return Response.json({});
  });
 } finally { methods.forEach((method, i) => { console[method] = original[i]; }); }
 expect(response!.status).toBe(503);
 const records = logs.map(line => JSON.parse(line));
 const failed = records.find(row => row.event === 'stage.failed');
 expect(failed).toMatchObject({stage:'google.freebusy',providerCode:'invalid_grant',upstreamStatus:400});
 expect(failed.hint).toContain('npm run calendar:connect');
 expect(records.every(row => row.requestId === response!.headers.get('X-Booking-Request-Id'))).toBe(true);
 expect(logs.join('\n')).not.toMatch(/secret-token|refresh-secret|visitor@example.com|Authorization|error_description/);
 expect(await response!.text()).not.toContain('invalid_grant');
});

test('concurrent requests keep independent IDs and preserve response statuses', async () => {
 const logs: string[]=[];const original=console.info;console.info=value=>{logs.push(String(value));};
 try {
  const responses=await Promise.all([1,2].map(i=>withBookingLogging(new Request('https://example.test/api/booking'), 'reserve', async()=>{
   await bookingStage('test.stage',async()=>{await new Promise(resolve=>setTimeout(resolve,i*5));});
   return Response.json({ok:true},{status:i===1?200:201});
  })));
  const ids=responses.map(response=>response.headers.get('X-Booking-Request-Id'));
  expect(ids[0]).not.toBe(ids[1]);expect(responses.map(r=>r.status)).toEqual([200,201]);
  for(const id of ids) expect(logs.map(line => JSON.parse(line)).filter(row=>row.requestId===id).map(row=>row.event)).toEqual(['request.started','stage.started','stage.succeeded','request.completed']);
 } finally {console.info=original;}
});

test('unknown provider messages, URLs and codes are not logged',()=>{
 const serialized=JSON.stringify(safeBookingError({code:'visitor@example.com',message:'secret',response:{status:401,data:{error:'token-value'}}}));
 expect(serialized).not.toMatch(/visitor@example.com|token-value|secret/);
 expect(JSON.parse(serialized).upstreamStatus).toBe(401);
});
