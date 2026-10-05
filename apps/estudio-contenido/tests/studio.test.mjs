import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const {build}=createRequire(require.resolve('wrangler/package.json'))('esbuild');
import { DatabaseSync } from 'node:sqlite';
import { readFileSync,mkdirSync } from 'node:fs';
import assert from 'node:assert/strict';
const sqlite=new DatabaseSync(':memory:');sqlite.exec(readFileSync('drizzle/0000_reflective_nightshade.sql','utf8'));
const db={prepare(sql){let args=[];const stmt=sqlite.prepare(sql);const wrap={bind(...a){args=a;return wrap;},async first(){return stmt.get(...args)||null;},async all(){return {results:stmt.all(...args)};},async run(){return stmt.run(...args);}};return wrap;},async batch(stmts){return Promise.all(stmts.map(x=>x.run()));}};
globalThis.__studioTestEnv={DB:db};mkdirSync('.sites-runtime',{recursive:true});
await build({entryPoints:['app/api/studio/route.ts'],outfile:'.sites-runtime/test-route.mjs',bundle:true,platform:'node',format:'esm',plugins:[{name:'test-env',setup(build){build.onResolve({filter:/^cloudflare:workers$/},()=>({path:'env',namespace:'test'}));build.onLoad({filter:/.*/,namespace:'test'},()=>({contents:'export const env=globalThis.__studioTestEnv;',loader:'js'}));}}]});
const {GET,POST}=await import('../.sites-runtime/test-route.mjs');
async function get(cookie=''){const r=await GET(new Request('https://example.test/api/studio',{headers:{cookie}}));return {body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]||cookie,status:r.status};}
async function post(cookie,body,origin='https://example.test'){const r=await POST(new Request('https://example.test/api/studio',{method:'POST',headers:{cookie,origin,'content-type':'application/json'},body:JSON.stringify(body)}));return {status:r.status,body:await r.json()};}
const a=await get(),b=await get();assert.equal(a.status,200);assert.equal(a.body.aiConfigured,false);assert.notEqual(a.cookie,b.cookie);
const profile={name:'Marca de prueba',occupation:'Coach de hábitos',offer:'Mentoría de 8 semanas',audience:'Profesionales independientes',pain:'Postergan las ventas',desire:'Constancia y claridad',values:'Honestidad y calma',tone:'Cercano',story:''};
assert.equal((await post(a.cookie,{action:'profile',profile})).status,200);assert.deepEqual((await get(a.cookie)).body.profile,profile);assert.equal((await get(b.cookie)).body.profile,null);
const brief={format:'Guion',platform:'Instagram',goal:'Atraer',topic:'Postergación',trends:false};
const draft=await post(a.cookie,{action:'draft',brief});assert.equal(draft.status,200);const idea=draft.body.ideas[0];idea.body='Borrador editado';idea.favorite=true;idea.published=true;idea.feedback='5 conversaciones';
assert.equal((await post(a.cookie,{action:'save',idea})).status,200);assert.equal((await get(a.cookie)).body.ideas[0].feedback,'5 conversaciones');assert.equal((await get(b.cookie)).body.ideas.length,0);
assert.equal((await post(b.cookie,{action:'save',idea})).status,404);assert.equal((await post(a.cookie,{action:'save',idea},'https://other.test')).status,403);assert.equal((await post('',{action:'profile',profile})).status,401);assert.equal((await post(a.cookie,{action:'profile',profile:{...profile,name:''}})).status,400);assert.equal((await post(a.cookie,{action:'generate',brief})).status,503);
// External API is mocked only in this test; no tokens are spent.
globalThis.__studioTestEnv.OPENAI_API_KEY='test-only';const realFetch=globalThis.fetch;let requestBody;
globalThis.fetch=async(_url,opts)=>{requestBody=JSON.parse(opts.body);return Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({ideas:[{title:'Una idea nueva',hook:'Un gancho concreto',body:'Un desarrollo completo',cta:'Cuéntame tu experiencia',reason:'Conecta con el problema descrito'}]})}]}]});};
const generated=await post(a.cookie,{action:'generate',brief});assert.equal(generated.status,200);assert.equal(generated.body.ideas[0].origin,'ai');assert.equal(requestBody.store,false);assert.equal(requestBody.text.format.type,'json_schema');
globalThis.fetch=async()=>Response.json({status:'completed',output:[{type:'web_search_call',action:{sources:[{url:'https://example.org/source',title:'Source for test'}]}},{type:'message',content:[{type:'output_text',text:'A research result with source and date.'}]}]});
const radar=await post(a.cookie,{action:'trends',brief});assert.equal(radar.status,200);assert.equal(radar.body.ideas[0].sources[0].url,'https://example.org/source');
globalThis.fetch=async()=>Response.json({status:'completed',output:[{type:'message',content:[{type:'output_text',text:'No sources'}]}]});assert.equal((await post(a.cookie,{action:'trends',brief})).status,503);
globalThis.fetch=realFetch;delete globalThis.__studioTestEnv.OPENAI_API_KEY;
console.log('PASS: persistence, session isolation, ownership, CSRF, validation, pending-AI state and mocked provider parsing. No live API test performed.');
