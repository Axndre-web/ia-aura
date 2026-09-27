# NEON PLAYER X — 10 fuentes económicas externas computables

La base existente se conserva. Esta capa añade un catálogo gobernado de diez clases de fuentes y un adaptador de lectura/verificación.

1. Publicidad programática — ingreso sólo con evidencia de impresión/clic/conversión y referencia de liquidación.
2. IPFS/Filecoin — infraestructura/recompensa; no se contabiliza por almacenar datos sin prueba de deal/reward/settlement.
3. Microtransacciones Web3 — sólo con transacción/receipt/evento confirmado.
4. Oráculos financieros — entrada de datos, no ingreso por sí misma; requiere referencia de cotización y marca temporal.
5. CDN/edge — ingreso o coste según contrato; requiere métrica de uso y/o factura.
6. Validadores — recompensa sólo con evidencia de cadena/época/bloque y referencia de estado o transacción.
7. Transcodificación/streaming — ingreso o coste según servicio; requiere job/usage/settlement.
8. Afiliados/referidos — comisión sólo con conversión y statement verificable.
9. Identidad descentralizada — acceso/coste; una identidad válida nunca se trata como dinero.
10. Telemetría/analítica — dato/coste; nunca se transforma automáticamente en ingreso.

## Regla económica

Una fuente puede aportar **datos**, **costes**, **recompensas** o **ingresos**. Su mera disponibilidad no crea valor económico. El flujo correcto es:

`fuente → evidencia → verificación → oportunidad/coste → rentabilidad neta → NEON_ORB → ejecución autorizada → settlement verificado → activo computable`

El adaptador externo usa únicamente destinos HTTPS permitidos por `NEON_ALLOWED_PROVIDER_HOSTS`. Las credenciales continúan fuera del código, mediante el proveedor de secretos existente.
