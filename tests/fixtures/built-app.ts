import { readFileSync, existsSync, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import type { Page } from '@playwright/test';
type Fixture = { availability?: (url: URL) => unknown; book?: (data: unknown) => {status?:number;body:unknown} };
/** Serves the production bundle through Playwright routing; never starts a server or contacts Google. */
export async function installBuiltApp(page:Page,fixture:Fixture={}){
 const root=process.cwd();
 await page.route('http://127.0.0.1:3000/**',async route=>{
  const url=new URL(route.request().url());
  if(url.pathname==='/api/booking/availability')return route.fulfill({json:fixture.availability?.(url)||{configured:false,slots:[]}});
  if(url.pathname==='/api/booking') {const result=fixture.book?.(route.request().postDataJSON())||{status:503,body:{message:'Not connected'}};return route.fulfill({status:result.status||200,json:result.body});}
  let file:string;
  if(url.pathname==='/contact')file=resolve(root,'.next/server/app/contact.html');
  else if(url.pathname==='/')file=resolve(root,'.next/server/app/index.html');
  else if(url.pathname.startsWith('/_next/static/'))file=resolve(root,'.next/static',url.pathname.slice('/_next/static/'.length));
  else if(url.pathname==='/_next/image')file=resolve(root,'public','.'+(url.searchParams.get('url')||''));
  else file=resolve(root,'public','.'+url.pathname);
  if(!file.startsWith(root+sep)||!existsSync(file)||!statSync(file).isFile())return route.fulfill({status:404,body:''});
  const types:Record<string,string>={'.html':'text/html','.js':'application/javascript','.css':'text/css','.ttf':'font/ttf','.png':'image/png','.webp':'image/webp','.pdf':'application/pdf'};
  return route.fulfill({body:readFileSync(file),contentType:types[extname(file)]||'application/octet-stream'});
 });
}
