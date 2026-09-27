# NEON ORB — Pipeline económico real y verificable

La base existente se conserva y la capa económica se amplía de forma aditiva.

## Flujo gobernado

`fuentes externas -> evidencia -> verificación de realidad -> rentabilidad neta -> NEON_ORB -> proveedor autorizado -> ejecución -> settlement verificado -> registro de activo real -> conversión monetaria`

### Reglas
- Una fuente externa no equivale por sí sola a ingresos.
- Las oportunidades deben aportar referencias de trabajo real, entregable y proveedor autorizado.
- Solo las oportunidades con `realityVerified=true` y proveedor autorizado entran en el ranking ejecutable.
- El gobernador NEON_ORB aplica límites de margen, beneficio, gasto y modo de ejecución.
- La ejecución se registra como `EXECUTED_PENDING_SETTLEMENT`; no se contabiliza como ingreso verificado.
- El settlement debe verificarse independientemente antes de registrar el activo económico.
- El registro `real-economic-registry.json` acepta únicamente activos verificados, con referencia de proveedor, trabajo, entregable y importe positivo.
- El conversor monetario separa importe, cotización, comisiones, red y slippage; no crea valor.
- Los endpoints externos están limitados por HTTPS y `NEON_ALLOWED_PROVIDER_HOSTS`.

## Proveedores autorizados

Configurar explícitamente:

`NEON_AUTHORIZED_EXECUTION_PROVIDERS=providerA=https://provider.example/execute,providerB=https://other.example/execute`

La presencia de una fuente en el catálogo económico no configura ni habilita automáticamente un proveedor real.

## Modo seguro por defecto

La ejecución económica permanece deshabilitada salvo configuración explícita de `NEON_EXECUTION_MODE=LIVE_EXECUTION` y `NEON_ALLOW_SPENDING=true`, además de las políticas del gobernador.
