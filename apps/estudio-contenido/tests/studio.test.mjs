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
assert.equal((await post(b.cookie,{action:'save',idea})).status,404);assert.equal((await post(a.cookie,{action:'save',idea},'https://other.test')).status,403);assert.equal((await post('',{action:'profile',profile})).status,401);assert.equal((await post(a.cookie,{action:'profile',profile:{...profile,name:''}})).status,400);
// The handoff must work without any external AI request, even if an old key exists.
const realFetch=globalThis.fetch;let externalCalls=0;
globalThis.__studioTestEnv.OPENAI_API_KEY='unused-test-only';
globalThis.fetch=async()=>{externalCalls++;throw new Error('Unexpected external request');};
assert.equal((await get(a.cookie)).body.generationMode,'chatgpt-handoff');
for(const action of ['generate','refine','trends'])assert.equal((await post(a.cookie,{action,brief})).status,409);
const imported={format:'Guion',title:'Una idea nueva',hook:'Un gancho concreto',body:'Un desarrollo completo\ncon otro párrafo',cta:'Cuéntame tu experiencia',reason:'Conecta con el problema descrito',sources:[]};
const radar={...imported,format:'Radar',title:'Investigación importada',sources:[{title:'Fuente de prueba',url:'https://example.org/source',publishedAt:'2026-10-01',checkedAt:'2026-10-05'}]};
const batchId=crypto.randomUUID(), content='```json\n'+JSON.stringify({ideas:[imported,radar]})+'\n```';
const input={action:'import',brief,batchId,content};
const added=await post(a.cookie,input);assert.equal(added.status,200);assert.equal(added.body.ideas.length,2);assert.equal(added.body.ideas[0].origin,'chatgpt');assert.equal(added.body.ideas[1].sources[0].checkedAt,'2026-10-05');
assert.equal((await get(a.cookie)).body.ideas.length,3);assert.equal((await get(b.cookie)).body.ideas.length,0);
// Retrying an import does not duplicate or overwrite edited content.
const edited={...added.body.ideas[0],body:'Versión editada después de importar'};
assert.equal((await post(a.cookie,{action:'save',idea:edited})).status,200);
const repeated=await post(a.cookie,input);assert.equal(repeated.body.ideas[0].body,edited.body);assert.equal((await get(a.cookie)).body.ideas.length,3);
assert.equal((await post(b.cookie,input)).status,400);
await post(b.cookie,{action:'profile',profile});
const other=await post(b.cookie,input);assert.equal(other.status,200);assert.notEqual(other.body.ideas[0].id,added.body.ideas[0].id);
for(const bad of ['not json',JSON.stringify({ideas:[]}),JSON.stringify({ideas:[imported,{...radar,sources:[{title:'Unsafe',url:'javascript:alert(1)'}]}]})]){
  assert.equal((await post(a.cookie,{...input,batchId:crypto.randomUUID(),content:bad})).status,400);
}
assert.equal((await get(a.cookie)).body.ideas.length,3);
assert.equal(externalCalls,0);globalThis.fetch=realFetch;delete globalThis.__studioTestEnv.OPENAI_API_KEY;
console.log('PASS: quiz, persistence, session isolation, edits, import, retry safety, source validation and zero external AI requests.');
