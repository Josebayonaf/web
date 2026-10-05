# Módulo Ads — Fórmula Jumpers

Presentación web de 26 diapositivas basada en el documento «MÓDULO ADS». Cubre los 15 temas del programa para coaches, mentores y profesionales de servicios que empiezan en lo digital.

## Uso

Abre `index.html` o la ruta publicada `/modulo-ads/`. No requiere instalaciones ni servicios de terceros para funcionar.

- Flechas izquierda y derecha: anterior y siguiente.
- Espacio: siguiente diapositiva.
- Inicio y Fin: primera y última.
- R: repetir la animación de la diapositiva.
- Movimiento: sí/no controla las animaciones; se respeta la preferencia del dispositivo.
- I: índice.
- N: guía de clase.
- F: pantalla completa, si el navegador la permite.
- Esc: cerrar un diálogo o salir de pantalla completa.
- En móvil: botones o deslizamiento horizontal.

Cada diapositiva tiene un enlace propio, por ejemplo `#15`. El formato se adapta a móvil y respeta la preferencia de movimiento reducido.

## Editar

- `slides.js`: títulos, contenido y notas de cada clase.
- `styles.css`: diseño y adaptación a dispositivos.
- `app.js`: navegación, animaciones con Web Animations API, interacciones y controles.
- `motion.css`: dirección visual de la edición de escenario y estilos responsivos.
- `scenes.js`: composiciones didácticas animadas; conserva las notas de slides.js.
- `assets/`: dos imágenes originales generadas con el motor interno de OpenAI.
- `recursos/`: ficha de campaña y registros de seguimiento y resultados.

Las guías de clase incluyen explicación, demostración a realizar en pantalla, tarea y criterio de comprobación. No son grabaciones ni capturas de una campaña real. Los casos y cifras son ilustrativos. La interfaz, los objetivos disponibles y las políticas de Meta deben confirmarse en la cuenta usada para las demostraciones. No se garantizan ventas.

Los CSV son plantillas de columnas vacías, sin datos personales ni fórmulas. Mantén tus registros completados fuera del repositorio público.

## Fuentes

- Documento proporcionado por José: «MÓDULO ADS».
- WhatsApp Business: https://whatsappbusiness.com/products/create-ads-that-click-to-whatsapp/ (consultado el 5 de octubre de 2026).
- Recurso de consulta para revisar políticas antes de publicar: https://transparency.meta.com/policies/ad-standards/ . La consulta automatizada devolvió un límite de acceso; su contenido no se presenta como verificado.

## Imágenes

Generación interna de OpenAI. No se usó Higgsfield. Prompts: `assets/prompts.txt`. Los archivos WebP conservan la composición de las imágenes generadas y reducen el peso de carga.

## Publicación

La carpeta `modulo-ads` se integra en el repositorio `Josebayonaf/web` sin cambiar la portada ni la configuración del dominio existente. GitHub Pages publica los archivos estáticos del repositorio. Si cambia la fuente de publicación, revisar la configuración de Pages antes de actualizar.

## Interacción durante la clase

- Diapositiva 3: selector WhatsApp / Instagram.
- Diapositiva 10: construcción secuencial del anuncio.
- Diapositiva 12: jerarquía animada de campaña, conjunto y anuncio.
- Diapositiva 16: conversación de ejemplo animada.
- Diapositiva 18: recorrido del anuncio al contacto.
- Diapositiva 21: calculadora en COP, manteniendo resultados fijos para explicar la fórmula. No predice rendimiento.
- Diapositiva 25: checklist interactivo. Los checks se mantienen mientras la página está abierta.

Las animaciones se cancelan al cambiar de slide y se pausan al ocultar la pestaña. Todo funciona localmente sin API, cuentas adicionales ni servicios de IA en tiempo de presentación.
