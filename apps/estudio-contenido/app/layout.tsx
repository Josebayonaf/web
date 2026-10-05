import type { Metadata } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Estudio de Contenido · Jumpers',description:'Convierte tu experiencia en contenido con intención. Quiz, ideas, guiones y carruseles para la comunidad Jumpers.',icons:{icon:'/favicon.svg',shortcut:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>;}
