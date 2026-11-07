import { expect, test } from '@playwright/test';
import { candidateSlots, monthRange, parseHours, removeBusy } from '../lib/booking-slots';
import { bookingSettings } from '../lib/booking-settings';
const hours=parseHours(JSON.stringify(bookingSettings.hours));
function slots(from:string,to:string) {return candidateSlots({from:Date.parse(from),to:Date.parse(to),now:Date.parse('2026-01-01T00:00:00Z'),timezone:bookingSettings.timezone,hours,duration:60,noticeHours:2,horizonDays:365});}
function local(instant:string){const p=new Intl.DateTimeFormat('en-US',{timeZone:bookingSettings.timezone,weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(instant));const get=(type:string)=>p.find(part=>part.type===type)?.value||'';return{day:get('weekday'),minute:Number(get('hour'))*60+Number(get('minute'))};}
test('owner class blocks exclude every overlapping 60-minute slot',()=>{
 const result=slots('2026-11-09T08:00:00Z','2026-11-14T08:00:00Z');
 expect(result.length).toBeGreaterThan(50);
 for(const slot of result){const start=local(slot.start),end=local(new Date(Date.parse(slot.end)-1).toISOString());const block=start.day==='Tue'?{from:15*60+30,to:19*60+45}:['Mon','Wed','Thu'].includes(start.day)?{from:17*60+45,to:19*60+45}:null;if(block)expect(start.minute>=block.to||end.minute<block.from).toBe(true);expect(Date.parse(slot.end)-Date.parse(slot.start)).toBe(3600000);}
 expect(result.some(slot=>{const p=local(slot.start);return p.day==='Mon'&&p.minute===19*60+45})).toBe(true);
});
test('open weekend hours and real instants survive the Seattle DST change',()=>{
 const result=slots('2026-11-01T07:00:00Z','2026-11-02T08:00:00Z');
 expect(result).toHaveLength(25);
 expect(result.filter(slot=>local(slot.start).minute===60)).toHaveLength(2);
 expect(new Set(result.map(slot=>slot.start)).size).toBe(25);
});
test('lead time and horizon exclude past and out-of-window slots',()=>{
 const now=Date.parse('2026-11-09T16:00:00Z');
 const result=candidateSlots({from:now-86400000,to:now+5*86400000,now,timezone:bookingSettings.timezone,hours,duration:60,noticeHours:2,horizonDays:2});
 expect(result.length).toBeGreaterThan(0);
 expect(result.every(slot=>Date.parse(slot.start)>=now+2*3600000&&Date.parse(slot.end)<=now+2*86400000)).toBe(true);
});
test('busy events exclude overlaps, preserve adjacent times, and apply buffers',()=>{
 const times=[{start:'2026-11-09T16:00:00Z',end:'2026-11-09T17:00:00Z'},{start:'2026-11-09T17:00:00Z',end:'2026-11-09T18:00:00Z'},{start:'2026-11-09T18:00:00Z',end:'2026-11-09T19:00:00Z'}];
 const busy=[{start:'2026-11-09T17:00:00Z',end:'2026-11-09T18:00:00Z'}];
 expect(removeBusy(times,busy)).toEqual([times[0],times[2]]);
 expect(removeBusy(times,busy,15)).toEqual([]);
});
test('schedule validation rejects overlapping ranges and invalid months',()=>{
 expect(()=>parseHours('[{"days":[1],"start":"09:00","end":"12:00"},{"days":[1],"start":"11:00","end":"13:00"}]')).toThrow();
 expect(()=>monthRange('2026-13')).toThrow();
 expect(()=>parseHours('[{"days":[1],"start":"09:01","end":"12:00"}]')).toThrow();
 expect(parseHours('[{"days":[0],"start":"00:00","end":"24:00"}]')).toHaveLength(1);
});
