# NEON ORB — Autonomía Operativa V11.8.1

## Objetivo

La capa de autonomía coordina observación, verificación y planificación sobre la base existente de NEON PLAYER X. No sustituye el núcleo económico, la PWA, el bridge ni la radio.

## Estado por diseño

- Modo: `GUARDED_AUTONOMY`
- Ejecución automática: `READ_VERIFY_ONLY`
- Firma de transacciones: desactivada
- Retiros autónomos: desactivados
- Gasto autónomo: desactivado
- Claves privadas: nunca se envían al navegador
- Ingresos: solo se contabilizan después de verificación externa válida

## Ciclo autónomo

El supervisor comprueba periódicamente:

1. Salud del NEON-LIM Bridge.
2. Estado de las 10 capacidades económicas externas.
3. Oportunidades externas previamente verificadas, cuando `NEON_AUTONOMY_DISCOVERY=true`.
4. Estado del gobernador económico y sus límites.

La supervisión no ejecuta una oportunidad ni firma una transacción. La ejecución real continúa protegida por `adminRequired`, allowlists HTTPS, límites económicos y los adaptadores existentes.

## Endpoints

- `GET /api/autonomy/status` — estado observable.
- `POST /api/autonomy/check` — fuerza una comprobación; requiere `NEON_ADMIN_TOKEN` en producción.

## Persistencia

El supervisor utiliza `NEON_AUTONOMY_STATE_FILE` y escribe con archivo temporal + rename. Los permisos del archivo de estado son `0600`.

## Proveedores

Las 10 fuentes económicas siguen siendo computables y verificables, pero una fuente no se considera conectada únicamente por existir en el catálogo. Debe disponer de endpoint HTTPS y hostname autorizado mediante `NEON_ALLOWED_PROVIDER_HOSTS`.
