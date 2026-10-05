# Estudio de Contenido Jumpers

Quiz de negocio, cliente y voz; encargo por formato/objetivo/plataforma; transferencia a ChatGPT; importación de ideas; editor, biblioteca, fuentes y aprendizajes.

## Estado

El estudio utiliza un flujo manual con ChatGPT: guardar el quiz → preparar y copiar el encargo → enviarlo en ChatGPT → pegar el bloque de respuesta → importar y editar. También permite guardar borradores propios, favoritos, resultados y exportar texto.

No llama a una API de IA ni requiere OpenAI Developers o una clave. La generación directa dentro del sitio no está habilitada. Usar ChatGPT consume los límites del plan de la persona; alojar una web en Sites no conecta automáticamente el plan a su backend.

El radar prepara una investigación para realizar en ChatGPT, conserva las fuentes y fechas importadas y advierte que deben revisarse. No verifica enlaces ni se actualiza automáticamente. Si ChatGPT no puede buscar, el encargo pide declarar esa limitación sin inventar fuentes. El panel de transferencia conserva su estado mientras la página permanezca abierta; no se debe recargar antes de importar.

Las pruebas directas con SQLite verifican persistencia, aislamiento, autorización, origen, importación, reintentos sin duplicados, conservación de cambios y rechazo de fuentes inseguras. También comprueban que no se realiza ninguna solicitud externa de IA. La revisión visual y WebMCP en navegador siguen pendientes porque el control de navegador requerido por este entorno no está disponible.

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

## Transferencia de contenido

`makeChatGPTPrompt` incluye perfil, brief, historial reciente y aprendizajes, y pide un bloque JSON de hasta 10 ideas. `parseImport` valida contenido y enlaces. La importación se guarda atómicamente con identificadores ligados a la sesión, el lote y la posición: reintentar el mismo lote no duplica ni sobrescribe ideas editadas. Preparar un nuevo encargo crea otro lote.

El inicio de sesión y el uso de un plan de ChatGPT son integraciones distintas. Documentación oficial: https://developers.openai.com/siwc/quickstart. Esta versión no implementa autorización para usar un plan desde el sitio.

## Datos y acceso

Cada visitante recibe una cookie aleatoria HttpOnly y SameSite=Strict. D1 guarda el perfil y contenido bajo ese identificador. Sin cuentas individuales, no hay recuperación entre dispositivos: borrar la cookie pierde acceso al historial. La aplicación informa que el historial corresponde a este navegador. Los datos de visitantes no se guardan en GitHub.

## Código y publicación

La entrega GitHub utiliza la rama `jumpers-estudio-contenido` de `Josebayonaf/web` y la carpeta `apps/estudio-contenido`. No modifica el sitio principal ni el diagnóstico. Sites aloja el estudio y conecta D1; GitHub conserva una copia editable. No hay despliegue automático desde GitHub configurado.

WebMCP expone lectura del estudio y preparación del tema; no genera contenido ni consume API sin la acción correspondiente. La validación requiere un navegador compatible.
