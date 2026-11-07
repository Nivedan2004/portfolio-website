import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import nextEnv from '@next/env';
import { OAuth2Client } from 'google-auth-library';
nextEnv.loadEnvConfig(process.cwd());
const clientId=process.env.GOOGLE_CLIENT_ID,clientSecret=process.env.GOOGLE_CLIENT_SECRET;
if(!clientId||!clientSecret){console.error('Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env.local first. See docs/CALENDAR_SETUP.md.');process.exit(1);}
const redirect='http://localhost:3344/callback';
const client=new OAuth2Client(clientId,clientSecret,redirect);
const state=randomBytes(32).toString('hex');
const verifier=await client.generateCodeVerifierAsync();
const url=client.generateAuthUrl({access_type:'offline',prompt:'consent',state,scope:['https://www.googleapis.com/auth/calendar.events','https://www.googleapis.com/auth/calendar.freebusy'],code_challenge:verifier.codeChallenge,code_challenge_method:'S256'});
const server=createServer(async(request,response)=>{
  const callback=new URL(request.url||'/',redirect);
  if(callback.pathname!=='/callback'){response.writeHead(404).end();return;}
  const received=callback.searchParams.get('state')||'';
  if(received.length!==state.length||!timingSafeEqual(Buffer.from(received),Buffer.from(state))){response.writeHead(403).end('Invalid state. Restart the connection command.');return;}
  const code=callback.searchParams.get('code');
  if(!code){response.writeHead(400).end('Authorization was not completed. Restart the connection command to retry.');return;}
  try{
    const {tokens}=await client.getToken({code,codeVerifier:verifier.codeVerifier,redirect_uri:redirect});
    if(!tokens.refresh_token)throw new Error('Google did not return a refresh token. Retry and grant offline access.');
    let env='';try{env=await readFile('.env.local','utf8');}catch{}
    const line=`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`;
    env=/^GOOGLE_REFRESH_TOKEN=.*$/m.test(env)?env.replace(/^GOOGLE_REFRESH_TOKEN=.*$/m,line):env.trimEnd()+'\n'+line+'\n';
    await writeFile('.env.local',env,{mode:0o600});
    response.writeHead(200,{'Content-Type':'text/plain'}).end('Google Calendar connected. You can close this tab. Finish the remaining settings in .env.local, then restart Next.js.');
    console.log('Refresh token saved to ignored .env.local. No credentials were printed.');
    clearTimeout(timeout);server.close();
  }catch(error){response.writeHead(500).end('Authorization could not be completed. Check your Google OAuth app settings and restart the connection command.');console.error('Google authorization failed. No credentials were saved.');}
});
const timeout=setTimeout(()=>{console.error('Calendar connection timed out. Run the command again to retry.');server.close();},5*60*1000);
server.listen(3344,'localhost',()=>{console.log('Open this Google consent URL in your browser:\n'+url+'\nWaiting for the local callback.');});
server.on('error',error=>{clearTimeout(timeout);console.error('Could not start the local calendar callback server:',error.message);process.exitCode=1;});
