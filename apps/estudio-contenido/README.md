# Estudio de Contenido Jumpers

Quiz de negocio, cliente y voz; brief por formato/objetivo/plataforma; editor; biblioteca; investigación con fuentes y feedback.

## Estado

La interfaz, el almacenamiento y la integración de API están implementados. La clave de OpenAI y la prueba con un proveedor real están pendientes. Sin clave, se pueden guardar el perfil y borradores, editar, exportar y copiar el brief. La aplicación indica claramente el estado pendiente.

El radar investiga bajo demanda, conserva fuentes y fecha de consulta, y rechaza investigaciones sin fuentes. No hay una tarea automática en segundo plano.

La revisión de tipos y la compilación pasaron. Las pruebas directas con SQLite verifican persistencia, aislamiento entre sesiones, autorización, origen, validación y respuestas simuladas de IA. La vista previa del entorno no respondió; la revisión visual y WebMCP en navegador están pendientes.

## Desarrollo

Requiere Node 22.13+ y pnpm. Conserva el lockfile.

```sh
pnpm install --frozen-lockfile
pnpm run build
pnpm run dev
node node_modules/typescript/bin/tsc --noEmit
node tests/studio.test.mjs
```

`pnpm run db:generate` genera migraciones cuando cambia el esquema. `.openai/hosting.json` declara D1; Sites conecta la base y aplica las migraciones al publicar.

## Activación de IA

Configura `OPENAI_API_KEY` como secreto del servidor y opcionalmente `OPENAI_MODEL` (valor inicial: `gpt-4.1-mini`). No expongas la clave en el navegador ni en variables `NEXT_PUBLIC_*`. Esta aplicación necesita una conexión de API propia; la suscripción de ChatGPT no la configura automáticamente.

La implementación utiliza Responses API, salida JSON y búsqueda web. Documentación oficial: https://developers.openai.com/api/docs/guides/tools-web-search

Límites iniciales: 12 solicitudes de IA por sesión/día y 100 al día en total. Una generación con investigación puede hacer dos llamadas; los intentos fallidos cuentan para limitar abuso. Configura también los controles de consumo de la cuenta antes de abrir acceso amplio.

## Datos y acceso

Cada visitante recibe una cookie aleatoria HttpOnly y SameSite=Strict. D1 guarda el perfil y contenido bajo ese identificador. Sin cuentas individuales, no hay recuperación entre dispositivos: borrar la cookie pierde acceso al historial. La aplicación informa que el historial corresponde a este navegador. Los datos de visitantes no se guardan en GitHub.

## Código y publicación

La entrega GitHub utiliza una rama independiente de `Josebayonaf/web` y la carpeta `apps/estudio-contenido`. No modifica el sitio principal ni el diagnóstico. El backend necesita un servidor; GitHub Pages por sí solo no ejecuta la IA o D1. Sites aloja la versión de revisión; GitHub conserva una copia editable. No hay despliegue automático desde GitHub configurado.

WebMCP expone lectura del estudio y preparación del tema; no genera contenido ni consume API sin la acción correspondiente. La validación requiere un navegador compatible.
