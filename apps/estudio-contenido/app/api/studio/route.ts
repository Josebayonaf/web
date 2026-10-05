import { env } from 'cloudflare:workers';
import { z } from 'zod';
import { profileSchema, briefSchema, parseImport, type Idea } from '@/lib/studio';
const runtime = () => env as unknown as {DB:D1Database};
const database=()=>{const db=runtime().DB;if(!db)throw new Error('El almacenamiento no está disponible. Conserva tus cambios e inténtalo de nuevo.');return db;};
function owner(req:Request){const match=req.headers.get('cookie')?.match(/(?:^|;\s*)jumpers_session=([a-f0-9]{64})(?:;|$)/);return match?.[1];}
function response(data:unknown,status=200,cookie?:string){return Response.json(data,{status,headers:{'Cache-Control':'no-store',...(cookie?{'Set-Cookie':cookie}:{})}});}
function failure(error:unknown){if(error instanceof SyntaxError)return response({error:'La solicitud no contiene un formato válido.'},400);if(error instanceof z.ZodError)return response({error:'Revisa los campos del quiz: completa los obligatorios y evita textos demasiado largos.'},400);console.error('studio',error instanceof Error?error.message:'unknown');return response({error:error instanceof Error?error.message:'No se pudo completar la operación.'},503);}
export async function GET(req:Request){try{let id=owner(req);let cookie:string|undefined;if(!id){id=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');cookie=`jumpers_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=31536000${new URL(req.url).protocol==='https:'?'; Secure':''}`;}
const db=database();const profile=await db.prepare('SELECT data FROM profiles WHERE owner = ?').bind(id).first<{data:string}>();const result=await db.prepare('SELECT data FROM creations WHERE owner = ? ORDER BY created DESC LIMIT 100').bind(id).all<{data:string}>();return response({profile:profile?JSON.parse(profile.data):null,ideas:result.results.map(x=>JSON.parse(x.data)),aiConfigured:false,generationMode:'chatgpt-handoff'},200,cookie);}catch(e){return failure(e);}}
async function save(id:string,idea:Idea){await database().prepare('INSERT INTO creations (id, owner, data, created) VALUES (?, ?, ?, ?)').bind(idea.id,id,JSON.stringify(idea),idea.created).run();}
export async function POST(req:Request){try{const id=owner(req);if(!id)return response({error:'Recarga la página para iniciar tu espacio.'},401);const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)return response({error:'Solicitud no permitida.'},403);if(Number(req.headers.get('content-length')||0)>150000)return response({error:'El texto es demasiado largo.'},413);const text=await req.text();if(text.length>150000)return response({error:'El texto es demasiado largo.'},413);const raw=JSON.parse(text);const action=z.enum(['profile','save','generate','refine','trends','draft','import']).parse(raw.action);const db=database();
if(action==='profile'){const p=profileSchema.parse(raw.profile);await db.prepare('INSERT INTO profiles (owner, data, updated) VALUES (?, ?, ?) ON CONFLICT(owner) DO UPDATE SET data = excluded.data, updated = excluded.updated').bind(id,JSON.stringify(p),new Date().toISOString()).run();return response({profile:p});}
if(action==='save'){const input=z.object({id:z.string().uuid(),title:z.string().min(1).max(300),hook:z.string().max(1200),body:z.string().max(18000),cta:z.string().max(1200),favorite:z.boolean(),published:z.boolean(),feedback:z.string().max(2000)}).parse(raw.idea);const old=await db.prepare('SELECT data FROM creations WHERE id = ? AND owner = ?').bind(input.id,id).first<{data:string}>();if(!old)return response({error:'No encontramos ese contenido en tu espacio.'},404);const updated={...JSON.parse(old.data),...input};await db.prepare('UPDATE creations SET data = ? WHERE id = ? AND owner = ?').bind(JSON.stringify(updated),input.id,id).run();return response({idea:updated});}
const saved=await db.prepare('SELECT data FROM profiles WHERE owner = ?').bind(id).first<{data:string}>();if(!saved)return response({error:'Completa y guarda el quiz de tu negocio antes de continuar.'},400);profileSchema.parse(JSON.parse(saved.data));const brief=briefSchema.parse(raw.brief);const now=new Date().toISOString();
if(action==='draft'){const idea:Idea={id:crypto.randomUUID(),format:brief.format,title:brief.topic||'Nuevo borrador',hook:'',body:'',cta:'',reason:'Borrador escrito por ti.',created:now,origin:'manual',sources:[],favorite:false,published:false,feedback:'',brief};await save(id,idea);return response({ideas:[idea]});}
if(action==='import'){
  const batchId=z.string().uuid().parse(raw.batchId);
  let input;
  try{input=parseImport(z.string().max(120000).parse(raw.content));}catch(error){return response({error:error instanceof Error?error.message:'Respuesta inválida.'},400);}
  const ideas:Idea[]=await Promise.all(input.map(async(item,index)=>{
    const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(`${id}:${batchId}:${index}`))),b=>b.toString(16).padStart(2,'0')).join('');
    const key=`${hash.slice(0,8)}-${hash.slice(8,12)}-4${hash.slice(13,16)}-a${hash.slice(17,20)}-${hash.slice(20,32)}`;
    const old=await db.prepare('SELECT data FROM creations WHERE id = ? AND owner = ?').bind(key,id).first<{data:string}>();
    return old?JSON.parse(old.data):{...item,id:key,created:now,origin:'chatgpt',favorite:false,published:false,feedback:'',brief};
  }));
  await db.batch(ideas.map(idea=>db.prepare('INSERT INTO creations (id, owner, data, created) VALUES (?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(idea.id,id,JSON.stringify(idea),idea.created)));
  return response({ideas});
}
return response({error:'Crea o investiga con el encargo de ChatGPT e importa la respuesta al estudio. Esta versión no realiza llamadas a una API de IA.'},409);
}catch(e){return failure(e);}}
