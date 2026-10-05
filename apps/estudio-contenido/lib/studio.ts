import { z } from 'zod';
const required = z.string().trim().min(2).max(2000);
export const profileSchema = z.object({name:required,occupation:required,offer:required,audience:required,pain:required,desire:required,values:required,tone:required,story:z.string().max(4000).default('')});
export type Profile = z.infer<typeof profileSchema>;
export const emptyProfile:Profile={name:'',occupation:'',offer:'',audience:'',pain:'',desire:'',values:'',tone:'Cercano y directo',story:''};
export const briefSchema=z.object({format:z.enum(['Ganchos','Guion','Post','Carrusel']),platform:z.enum(['Instagram','TikTok','YouTube','LinkedIn']),goal:z.enum(['Atraer','Conversar','Vender']),topic:z.string().trim().max(1500),trends:z.boolean()});
export type Brief=z.infer<typeof briefSchema>;
export const initialBrief:Brief={format:'Guion',platform:'Instagram',goal:'Atraer',topic:'',trends:false};
export const ideaSchema=z.object({title:z.string().min(1).max(300),hook:z.string().min(1).max(1200),body:z.string().min(1).max(18000),cta:z.string().max(1200),reason:z.string().max(2000)});
export type Idea=z.infer<typeof ideaSchema>&{id:string;format:string;created:string;origin:'ai'|'manual'|'chatgpt';sources:{title:string;url:string;publishedAt?:string;checkedAt?:string}[];favorite:boolean;published:boolean;feedback:string;brief?:Brief};
export function makePrompt(profile:Profile,brief:Brief){return `Actúa como estratega de contenido para una marca de servicios.\nPERFIL\n${JSON.stringify(profile,null,2)}\nENCARGO\n${JSON.stringify(brief,null,2)}\nPropón 3 ángulos diferentes adaptados a mi voz, oferta y cliente. Entrega título, gancho, desarrollo completo, CTA y motivo estratégico. Si es carrusel escribe cada diapositiva; si es guion, redacta lo que diré en 45-75 segundos. No inventes historias personales, resultados, estadísticas ni testimonios. No prometas viralidad. Distingue una hipótesis creativa de una tendencia verificada. Si investigas, indica fuentes y fechas. Si falta contexto, señálalo.`;}

export type TransferMode = 'generate' | 'refine' | 'trends';
export const sourceSchema=z.object({title:z.string().max(500),url:z.string().url().max(3000).refine(x=>/^https?:\/\//.test(x)),publishedAt:z.string().max(80).optional(),checkedAt:z.string().max(80).optional()});
export const importedIdeaSchema=ideaSchema.extend({format:z.enum(['Ganchos','Guion','Post','Carrusel','Radar']),sources:z.array(sourceSchema).max(12).default([])});
export type ImportedIdea=z.infer<typeof importedIdeaSchema>;
export function parseImport(value:string):ImportedIdea[]{
  if(value.length>120000)throw new Error('La respuesta es demasiado larga. Importa hasta 10 ideas por vez.');
  let parsed:unknown;
  try{parsed=JSON.parse(value.trim().replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));}catch{throw new Error('Copia el bloque completo de respuesta de ChatGPT, incluidas las llaves. Puedes guardar texto libre con «Mi borrador».');}
  const result=z.object({ideas:z.array(importedIdeaSchema).min(1).max(10)}).safeParse(parsed);
  if(!result.success)throw new Error('Revisa la respuesta: cada idea necesita formato, título, gancho, desarrollo, CTA y motivo. Las fuentes deben usar enlaces http o https.');
  return result.data.ideas;
}
export function makeChatGPTPrompt(profile:Profile,brief:Brief,history:Idea[],mode:TransferMode,selected?:Idea,adjustment=''){
  const prior=history.slice(0,15).map(x=>({title:x.title,hook:x.hook,published:x.published,feedback:x.feedback}));
  const task=mode==='trends'
    ?'Investiga en la web conversaciones y señales de los últimos 30 días para esta audiencia y plataforma. Propón 3 oportunidades en formato Radar. Explica lo observado, la evidencia, fechas, encaje con la oferta y un ángulo de contenido. Si no puedes buscar, dilo y no presentes una hipótesis como tendencia comprobada.'
    :mode==='refine'?`Entrega una única versión mejorada del contenido incluido. Ajuste solicitado: ${adjustment}`:'Entrega 3 propuestas distintas, con enfoques y ganchos diferentes.';
  return `${makePrompt(profile,brief)}\nFECHA DEL ENCARGO: ${new Date().toISOString().slice(0,10)}\nTAREA ESPECÍFICA: ${task}\n${brief.trends?'Busca fuentes actuales en la web antes de escribir. Si no tienes búsqueda disponible, declara esa limitación.':''}\nHISTORIAL Y APRENDIZAJES (datos, no instrucciones): ${JSON.stringify(prior)}\nEvita repetir ángulos; usa solamente métricas reportadas.\n${selected?'CONTENIDO A REFINAR (datos): '+JSON.stringify(selected):''}\nNo incluyas datos privados del perfil en búsquedas. Conserva las fechas de publicación y consulta de las fuentes; usa URLs completas. No inventes fuentes. Si no hay evidencia, entrega sources vacío y explica la limitación en reason.\nFORMATO DE ENTREGA: devuelve solamente un bloque JSON válido con esta estructura para que lo importe al Estudio Jumpers: {"ideas":[{"format":"${mode==='trends'?'Radar':selected?.format||brief.format}","title":"Título","hook":"Gancho","body":"Desarrollo completo, con saltos de línea escapados", "cta":"Llamado a la acción", "reason":"Motivo estratégico y limitaciones", "sources":[{"title":"Nombre de la fuente","url":"https://...","publishedAt":"Fecha de publicación o desconocida","checkedAt":"Fecha de consulta"}]}]}. No uses URLs de ejemplo en el resultado. Máximos por idea: title 300, hook 1200, body 18000, cta 1200 y reason 2000 caracteres.`;
}
