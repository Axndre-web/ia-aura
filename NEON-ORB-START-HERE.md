# NEON ORB — PAQUETE COMPLETO v11.7.1

Este paquete conserva la estructura existente de NEON PLAYER X y añade las capas de radio, economía externa, valoración de activos y descubrimiento de trabajo computable.

## Regla de integridad

No es necesario modificar `core/`, `integrations/`, `public/`, `UI/` ni el motor del servidor para cambiar la identidad pública o los conectores. Utiliza `.env` a partir de `.env.example`.

## Puesta en marcha

1. Instala Node.js 20+.
2. Ejecuta `npm install`.
3. Copia `.env.example` a `.env`.
4. Completa únicamente los valores que realmente tengas autorizados.
5. Ejecuta `npm test`.
6. Ejecuta `npm start`.
7. Comprueba `/healthz` y `/api/neon-orb/profile`.

## Identidad pública

La dirección Solana pública configurada para Neon Orb es:

`CpiWyv2tyrbBqZoZMSTcVRgCGPwKgJ2jCyZ7aN1n7fSE`

Una dirección pública no permite firmar ni gastar fondos. Las claves privadas/seed nunca se incluyen en este paquete.

## Trabajo externo real

Los conectores distinguen entre:

- descubrimiento público;
- valoración de una oportunidad;
- preparación de una operación;
- ejecución mediante credencial/API autorizada;
- verificación externa del resultado.

El ledger no convierte una valoración en dinero disponible. Solo un resultado externo verificable puede convertirse en ingreso verificado.

## Credenciales

No se almacenan contraseñas de cuentas en el proyecto. Para servicios que soportan OAuth/API se usan tokens o secretos del servidor. Las credenciales deben introducirse en el entorno de ejecución o en un gestor de secretos.

## Nombres de archivos

Los nombres funcionales no necesitan edición manual. Si tu proveedor de alojamiento exige otros nombres, utiliza `FILE-NAME-MAP.txt` como referencia y conserva las rutas internas. No cambies nombres de módulos dentro de `core/` o `server/` salvo que también actualices sus importaciones.
