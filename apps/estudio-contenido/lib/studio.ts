import { z } from 'zod';
const required = z.string().trim().min(2).max(2000);
export const profileSchema = z.object({name:required,occupation:required,offer:required,audience:required,pain:required,desire:required,values:required,tone:required,story:z.string().max(4000).default('')});
export type Profile = z.infer<typeof profileSchema>;
export const emptyProfile:Profile={name:'',occupation:'',offer:'',audience:'',pain:'',desire:'',values:'',tone:'Cercano y directo',story:''};
export const briefSchema=z.object({format:z.enum(['Ganchos','Guion','Post','Carrusel']),platform:z.enum(['Instagram','TikTok','YouTube','LinkedIn']),goal:z.enum(['Atraer','Conversar','Vender']),topic:z.string().trim().max(1500),trends:z.boolean()});
export type Brief=z.infer<typeof briefSchema>;
export const initialBrief:Brief={format:'Guion',platform:'Instagram',goal:'Atraer',topic:'',trends:false};
export const ideaSchema=z.object({title:z.string().min(1).max(300),hook:z.string().min(1).max(1200),body:z.string().min(1).max(18000),cta:z.string().max(1200),reason:z.string().max(2000)});
export type Idea=z.infer<typeof ideaSchema>&{id:string;format:string;created:string;origin:'ai'|'manual';sources:{title:string;url:string}[];favorite:boolean;published:boolean;feedback:string;brief?:Brief};
export function makePrompt(profile:Profile,brief:Brief){return `Actúa como estratega de contenido para una marca de servicios.\nPERFIL\n${JSON.stringify(profile,null,2)}\nENCARGO\n${JSON.stringify(brief,null,2)}\nPropón 3 ángulos diferentes adaptados a mi voz, oferta y cliente. Entrega título, gancho, desarrollo completo, CTA y motivo estratégico. Si es carrusel escribe cada diapositiva; si es guion, redacta lo que diré en 45-75 segundos. No inventes historias personales, resultados, estadísticas ni testimonios. No prometas viralidad. Distingue una hipótesis creativa de una tendencia verificada. Si investigas, indica fuentes y fechas. Si falta contexto, señálalo.`;}
