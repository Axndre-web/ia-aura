# NEON PLAYER X — GitHub Pages (frontend estático)

## Publicar
1. Crea un repositorio GitHub nuevo.
2. Sube **el contenido de esta carpeta** a la raíz del repositorio (incluidos `index.html`, `UI/`, `core/` y `.nojekyll`).
3. En **Settings → Pages**, selecciona `Deploy from a branch`, la rama principal y `/ (root)`.
4. Espera a que termine el despliegue y abre la URL de Pages.

También puedes subir esta carpeta a `/docs` y configurar Pages para publicar desde `/docs`.

## Qué funciona sin backend
- Interfaz completa, 12 temas, navegación, animaciones y controles locales.
- Radio por streams HTTPS de terceros (la disponibilidad y CORS/codec dependen de cada emisora).
- Reproductor multimedia local para archivos que el usuario seleccione; la selección no se sube.
- Carrito local y generación de pedido por WhatsApp.
- NEON ORB: CYBER POWER SLOTS con 100 créditos virtuales iniciales, apuestas/tiradas de demostración, ledger local e historial persistidos en `localStorage`.
- Paneles de wallet, trabajo y preparación en modo explícitamente local/estático, sin falsificar saldos externos.
- Caché offline básica mediante service worker cuando se sirve por HTTPS.

## Límites deliberados de GitHub Pages
GitHub Pages sirve archivos estáticos. No ejecuta Express, Python ni un daemon; por tanto, la versión estática no verifica pagos, no consulta el ledger privado, no ejecuta trabajos, no firma transacciones y no acepta pagos PayPal. El checkout muestra un aviso y no carga el SDK de pagos. Las cotizaciones de intercambio y las verificaciones que requieren backend quedan desactivadas.

`localStorage` persiste solo en el navegador y el origen actual. Borrar datos del navegador, usar otro dispositivo o cambiar el dominio puede borrar/separar el progreso. No es un ledger remoto ni prueba ingresos reales. Los 100 créditos son virtuales, no canjeables y solo del arcade.

## Seguridad
Este paquete está preparado para publicación pública: **no contiene `.env`, credenciales privadas, semillas, `keypair`, código del servidor ni el puente Python**. Nunca subas secretos a un repositorio público. Si se necesitan pagos reales, deben procesarse en un backend independiente y seguro.

## Comprobación local opcional
Con Node.js instalado, ejecuta `node tests/static-build.test.mjs`. Esto valida secciones principales, referencias de archivos, modo estático y exclusión de archivos sensibles; no sustituye una prueba en el navegador después de publicar.
