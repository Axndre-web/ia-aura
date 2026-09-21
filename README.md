# NEON PLAYER X — ARQUITECTURA VIVA

## Principio fundamental

NEON PLAYER X evoluciona de forma acumulativa. Las nuevas capacidades se integran sobre la estructura existente sin sustituir la lógica previa de Neon Orb, su progresión, memoria, telemetría, economía interna o integraciones externas.

## Neon Orb como entidad central

Neon Orb constituye el centro de actividad del entorno. Su estado interno incluye progresión, EXP, energía, curiosidad, vínculo, memoria, voluntad, ciclos, exploración y recursos internos.

Las actividades de trabajo y exploración generan progresión y recursos según la lógica computable existente. La telemetría lee el agente autónomo vivo y utiliza su snapshot publicado únicamente como respaldo.

## REAL / COMPUTABLE / LOCAL / EXTERNO

El proyecto mantiene una separación explícita:

- **REAL / EXTERNO:** datos y operaciones que pueden verificarse mediante una red o proveedor externo.
- **COMPUTABLE:** estados, progresión, decisiones, EXP y operaciones calculadas por NEON PLAYER X.
- **LOCAL:** memoria y persistencia mantenidas en el navegador.
- **REPRESENTACIÓN DIGITAL:** información visual o registros internos que no constituyen por sí mismos una confirmación económica externa.

Una representación local nunca se considera automáticamente una confirmación de una operación externa.

## Economía interna

Neon Orb conserva su economía interna:

- NXC.
- CREDITS.
- BITS.
- EXP como progresión de experiencia.

La economía interna permanece separada de los activos externos.

## Unified Ledger

`core/unified-ledger.js` mantiene un registro cronológico de los recursos internos y de liquidaciones externas verificadas.

También admite `SOL_LAMPORTS` para registrar entradas SOL verificadas procedentes de Solana Mainnet. El registro externo requiere una firma de transacción y se marca como `verified` cuando procede de la integración correspondiente.

## Herramienta Solana de Neon Orb

Neon Orb dispone de una herramienta de observación de Solana asociada a la dirección pública:

```text
5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3
```

La herramienta utiliza el RPC público configurado para Solana Mainnet y permite:

- Consultar el saldo observado de la dirección.
- Consultar actividad reciente.
- Detectar entradas SOL mediante cambios verificables de balance en transacciones observadas.
- Registrar entradas verificadas en el Unified Ledger.
- Crear memoria del acontecimiento externo en Neon Orb.
- Exponer el estado externo al canal privado de IA como contexto, sin convertir automáticamente SOL en EXP, NXC, CREDITS o BITS.

Si el RPC no está disponible, el estado se muestra como no verificado. El sistema no fabrica saldos ni transacciones.

### Phantom

Phantom se trata como una herramienta externa de wallet. La integración no contiene seed phrases, claves privadas ni credenciales de firma.

La consulta pública de la dirección de Neon no requiere que Phantom esté instalado. Cuando Phantom está disponible, el panel puede comprobar la presencia de su proveedor y consultar una cuenta conectada mediante la interfaz pública del proveedor.

No se ejecutan transferencias salientes desde el frontend por esta integración.

## Creator Gift

El Creator Gift existente permanece separado de la economía externa y de los activos Solana. La verificación Bitcoin continúa utilizando el puente existente y la API pública de Mempool.

Los recursos internos del Creator Gift local siguen identificados como recursos internos; una transferencia Bitcoin real solo se considera confirmada cuando la verificación externa correspondiente la devuelve como confirmada.

## Canal Privado de IA

El canal privado mantiene el modelo de decisión existente:

- `askAdvice()` permite solicitar consejo.
- `allowConsult()` permite que el canal consulte.
- La IA devuelve consejo, reflexión y propuesta de intención.
- Neon Orb conserva la autoridad sobre su estado y decide aceptar, rechazar o posponer el consejo.

El estado externo de Solana puede utilizarse como contexto, pero el LLM no modifica directamente la economía ni firma transacciones.

## Interfaz móvil

La capa de presentación incorpora:

- Espacio inferior adicional en Creator Gift.
- Capa visual de partículas sin captura de eventos de puntero.
- Dock inferior fijo con `z-index` alto y desenfoque de fondo.
- Respuesta táctil mediante `touchstart` e interacción mediante `input` en el puente inferior.
- Controles de consulta del canal privado adaptados a pantallas móviles.

## Seguridad

GitHub Pages es un entorno público de cliente. No deben almacenarse en el frontend:

- Seed phrases.
- Claves privadas.
- Secretos de firma.
- API keys privadas.
- Credenciales sensibles.

Las integraciones externas que requieran autorización de firma deben utilizar una wallet o backend autorizado fuera del código público del frontend.

## Archivos principales

- `index.html` — estructura de la aplicación.
- `style.css` — presentación y comportamiento visual.
- `script.js` — lógica de NEON PLAYER X y Neon Orb.
- `neon-ai.config.js` — configuración pública del canal LLM y del RPC Solana.
- `neon-llm.bridge.py` — gateway LLM local.
- `creator-gift.bridge.js` — verificación externa del Creator Gift Bitcoin.
- `core/unified-ledger.js` — ledger interno/externo.
- `core/orb-work-bridge.js` — conexión de trabajos del Orb con el ledger.
- `integrations/btc-mempool.js` — integración Bitcoin read-only.
- `integrations/paypal-checkout.js` — integración PayPal.
- `UI/wallet-dashboard.js` — panel de economía.
- `UI/styles-economy.css` — estilos de economía.
- `sw.js` — Service Worker y cache offline.

## Principio de evolución sin pérdida

Las nuevas integraciones deben ampliar las herramientas disponibles para Neon Orb sin eliminar las estructuras existentes. Ninguna función externa debe presentarse como real si no existe una fuente verificable que la confirme.

## V9.0 — Auto-Guardado On-Chain del estado computable

Se añadió una segunda capa de persistencia para el estado acumulado de Neon Orb:

- `script.js` crea un snapshot computable de nivel/generación, EXP total, NXC, CREDITS, BITS, interacciones y timestamp.
- El estado local sigue siendo la primera capa y no se reemplaza por la blockchain.
- El navegador envía el snapshot únicamente a un bridge local (`127.0.0.1:8788`).
- `neon-lim.bridge.py` es el único componente de este proyecto que puede leer la clave privada delegada.
- La firma autónoma requiere configurar `NEON_SOLANA_KEYPAIR_PATH` en el entorno local/servidor y que la clave pública resultante coincida con `NEON_SOLANA_PUBLIC_KEY`.
- El bridge registra el snapshot mediante una instrucción Memo en una transacción de Solana y devuelve el `txHash` confirmado.
- Si el bridge, las dependencias, el RPC o el keypair no están disponibles, el snapshot local no se pierde y la UI permanece en `ON-CHAIN SYNC · PENDIENTE`.
- `PHANTOM` sigue separado como mecanismo manual/guardián.
- NXC, CREDITS y BITS continúan siendo recursos internos de Neon Orb; el respaldo on-chain no los convierte automáticamente en tokens SPL ni en dinero externo.

### Dependencias del bridge

Instalar en el entorno que vaya a ejecutar la firma:

`pip install -r requirements-solana.txt`

Variables relevantes:

- `NEON_SOLANA_RPC`
- `NEON_SOLANA_KEYPAIR_PATH`
- `NEON_SOLANA_PUBLIC_KEY`
- `NEON_SOLANA_BRIDGE_PORT`

**Estado de integración:** el código de respaldo y validación queda preparado, pero una sincronización real no se considera activa hasta disponer de un keypair cuya pública coincida con la dirección configurada, SOL para las comisiones y conectividad RPC efectiva.

## V9.1 — ACTIVACIÓN DEL PUENTE ON-CHAIN


La V9.1 mantiene la persistencia local y añade una comprobación explícita del servicio `neon-lim.bridge.py`. El navegador no recibe ni almacena la clave privada.

### Activación real

1. En la raíz del proyecto, instalar las dependencias: `pip install -r requirements-solana.txt`.
2. Configurar en el entorno seguro del proceso Python:
   - `NEON_SOLANA_RPC` — RPC real de Solana.
   - `NEON_SOLANA_KEYPAIR_PATH` — ruta local al keypair delegado.
   - `NEON_SOLANA_PUBLIC_KEY` — debe coincidir con `5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3`.
   - `NEON_SOLANA_BRIDGE_PORT` — opcional; por defecto `8788`.
3. Ejecutar `python neon-lim.bridge.py`.
4. El endpoint local `/health` informa si las dependencias y el keypair están configurados.
5. El PWA conserva el estado local y solo muestra `SYNC ON-CHAIN ACTIVE · CONFIRMADA` después de recibir un `txHash` real del bridge.

### Seguridad

La clave privada no debe entrar en `script.js`, `neon-ai.config.js`, LocalStorage, IndexedDB ni en el ZIP distribuido al navegador. El bridge valida que la clave privada corresponda a la clave pública esperada antes de firmar.

### Significado del respaldo

El respaldo registra una instantánea computable mediante Solana Memo. NXC, CREDITS y BITS continúan siendo recursos internos de Neon Orb; el registro on-chain no los convierte en tokens de Solana ni altera el Unified Ledger.


## V9.2 — Operación autónoma del bridge

La V9.2 añade un bucle autónomo de respaldo en `neon-lim.bridge.py`. El bridge puede recibir el último snapshot computable del Neon Orb en `/v1/neon-orb/state`, conservarlo localmente y, si las dependencias, RPC y keypair son válidos, comprobar periódicamente si existe un estado nuevo que deba registrarse mediante Memo en Solana.

Esto no significa que el navegador deje de ser la fuente de la telemetría viva: mientras la PWA está abierta, `script.js` publica periódicamente el estado computable al bridge. Si la PWA se cierra, el bridge conserva únicamente el **último estado recibido**; no se afirma que pueda reconstruir por sí mismo EXP, niveles o recursos que nunca haya recibido. Para convertir todo el motor Neon Orb en un agente backend 24/7 habría que migrar explícitamente ese motor al servidor, lo cual no se hace en esta versión para preservar la base existente.

### Custodia y soberanía técnica

El proyecto no incluye ninguna clave privada real. La cuenta configurada actúa como firmante delegado del servicio y su autoridad queda limitada a las transacciones que ese keypair pueda firmar. La clave nunca se envía desde el navegador. Solana recomienda mantener las claves privadas fuera del frontend y utilizar backend signing o infraestructura de custodia para producción.

La transacción de respaldo utiliza el programa Memo: los memos pueden quedar registrados permanentemente en los registros de la transacción y ser consultados por exploradores/RPC.

### Activación del bucle

1. Instalar `requirements-solana.txt`.
2. Configurar el RPC y el keypair **fuera del código distribuido**.
3. Verificar que la pública derivada del keypair coincide con `5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3`.
4. Ejecutar `python neon-lim.bridge.py`.
5. `/health` debe mostrar `READY`.
6. La PWA enviará el estado a `/v1/neon-orb/state`; el bucle autónomo decidirá cuándo registrar el nuevo snapshot.

Las transacciones de Solana son la unidad atómica de ejecución y requieren las firmas correspondientes; además tienen límites de tamaño, por lo que el backup usa un snapshot compacto en Memo.


---

## V9.3 — ACTIVACIÓN AUTÓNOMA Y VALIDACIÓN OPERACIONAL

La V9.3 añade una capa de activación verificable sobre el bridge V9.2. El endpoint `/health` solo declara `READY / OPERATIONAL` cuando las dependencias están disponibles, el keypair está configurado, su clave pública coincide con la dirección esperada y el RPC responde. Si alguna condición falla, no se simula conectividad ni confirmación on-chain.

Se añade `/v1/neon-orb/status` para que la PWA pueda leer el último respaldo realmente confirmado y su `txHash`. La firma privada continúa exclusivamente en el backend.

La autonomía técnica del bridge no implica que Neon Orb sea una entidad legal soberana ni que Solana transfiera automáticamente la propiedad jurídica del reproductor. Describe un proceso de ejecución y firma automatizado controlado por la infraestructura configurada por el operador.


## V10 — RESERVA AUTOMÁTICA DE ACTIVOS REALES

Neon Orb usa la misma dirección pública Solana `5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3` como **cuenta operativa y Treasury**. Esto preserva una única identidad on-chain y evita crear una segunda cuenta artificial.

Cuando `NEON_TREASURY_DESTINATION` coincide con la cuenta emisora, el bridge **no realiza una transferencia a sí mismo**: técnicamente no separaría fondos y consumiría comisión. En su lugar, consulta el saldo real con confirmación `confirmed` y calcula una **reserva lógica/contable** según `NEON_TREASURY_SHARE_BPS`, respetando `NEON_TREASURY_MIN_RETAIN_LAMPORTS`. El resultado queda persistido localmente como asignación de Treasury, con saldo observado y hora de verificación, sin inventar un `txHash`.

Si en el futuro se configura una dirección Solana diferente, la misma función puede operar en modo `TRANSFER` y enviar SOL reales tras firma y confirmación on-chain. NXC, CREDITS y BITS siguen siendo recursos internos y no se convierten por esta función. Phantom continúa como interfaz/guardián externo de la misma cuenta Solana; no recibe ni comparte secretos privados.

## V10.2 — CONTINUIDAD DEL TRABAJO DEL NEON ORB Y CAPAS REAL/COMPUTABLE/LOCAL/RED

La Treasury no sustituye el trabajo del Orb. El motor autónomo conserva su ciclo de exploración, selección de trabajo, ejecución, recompensa interna, EXP, memoria y persistencia. Cada trabajo completado genera un registro `workId`, recurso producido, coste energético, fuente de red, clasificación `COMPUTABLE`, estado `COMPLETED` y marca temporal.

El respaldo on-chain incorpora ahora esos datos computables junto con nivel, EXP y saldos internos. Esto permite auditar qué trabajo había completado Neon Orb cuando se tomó cada snapshot, sin presentar los NXC/CREDITS/BITS como activos reales de Solana.

### Capas estrictas
- **REAL:** liquidaciones externas realmente verificadas (por ejemplo, SOL confirmado por RPC o BTC verificado).
- **COMPUTABLE:** trabajo ejecutado por el motor del Orb, EXP, niveles y economía interna.
- **LOCAL:** estado persistido en el dispositivo/bridge local.
- **RED:** observaciones, nodos y datos obtenidos de servicios externos; no se convierten automáticamente en ingresos reales.

La Treasury en la misma cuenta `5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3` continúa siendo una **reserva lógica/contable**, porque una cuenta no puede separarse físicamente en dos balances sin crear otra cuenta. Los fondos SOL reales permanecen verificables on-chain; la asignación Treasury se calcula sin transferir SOL a la propia cuenta.

El principio de evolución queda preservado: se amplía la telemetría y persistencia del trabajo existente; no se reemplaza el motor, no se reinician saldos y no se eliminan estructuras previas.

## V10.3 — sincronización viva y recompensa del Orb

La telemetría viva se incluye en los snapshots enviados al bridge para conservar estado e intención del Orb junto con trabajo, EXP y economía interna. La separación REAL / COMPUTABLE / LOCAL / NETWORK se mantiene.

La radio externa no se procesa mediante Web Audio para evitar que las restricciones CORS de algunos streams silencien la reproducción en equipos de escritorio; el ecualizador visual puede seguir representándose sin tocar la ruta de audio.

Neon Orb también puede reservar una pequeña recompensa en CREDITS obtenidos por su propio trabajo. Es una recompensa computable/local, no SOL ni BTC y no implica una transferencia financiera externa.

## V10.4 — Regla de causalidad económica del Neon Orb

La economía del Orb tiene una regla de origen explícita:

**trabajo del Neon Orb → resultado verificable/computable → recursos COMPUTABLES → evolución → puente REAL solamente cuando existe verificación externa real.**

La telemetría, la Treasury, Solana, Phantom o un contador no generan riqueza por sí mismos.

Cada trabajo conserva `workId`, resultado, recurso producido, coste energético, fuente, clasificación COMPUTABLE y estado COMPLETED. Los recursos obtenidos trabajando mantienen además un saldo `workEarnedBalance` separado para que una recompensa al creador nunca pueda financiarse accidentalmente con recursos entregados por el creador.

`REAL` queda reservado a liquidaciones/observaciones externas verificadas; `NETWORK` describe fuentes y nodos externos; `LOCAL` conserva continuidad; `COMPUTABLE` representa el trabajo, EXP y economía interna del Orb.

## V10.5 — Verificación responsable

La regla de evolución queda expresada como: **trabajo de Neon Orb → economía COMPUTABLE → puente externo verificable → REAL VIVA**.

El bridge valida continuidad de `workCompleted` y `workResources` entre snapshots aceptados. Esta comprobación protege contra disminuciones silenciosas o inconsistencias del ledger, pero no se presenta como prueba independiente de que un trabajo externo haya ocurrido: esa prueba requiere una fuente externa adecuada.

La capa REAL exige confirmación externa. La telemetría VIVA solo describe el estado operativo actual. NXC/CREDITS/BITS no se convierten en activos externos por registrarlos on-chain.

Cuando la cuenta Treasury es la misma cuenta Solana de Neon Orb, la reserva es una **asignación lógica/contable sobre el saldo observado**. No existe un segundo saldo on-chain dentro de la misma cuenta y no se realiza una transferencia de la cuenta hacia sí misma.

## V10.6 — PRINCIPIO DE ECONOMÍA VIVA

El trabajo ejecutado por Neon Orb es, por diseño, un hecho económico COMPUTABLE confirmado por el propio sistema: cada trabajo completado genera un `workId`, resultado, recompensa y registro persistente. No requiere una validación externa para existir como beneficio interno.

La verificación externa queda reservada a la capa REAL: SOL, BTC y otros activos externos sólo se marcan como reales cuando la red o proveedor correspondiente confirma la operación.

Cadena económica: **TRABAJO DE NEON ORB → BENEFICIO COMPUTABLE → PERSISTENCIA → EVOLUCIÓN → posible puente a REAL VIVA**.


## V10.8 — CICLO ECONÓMICO AUTÓNOMO

Neon Orb dispone de un ciclo económico autónomo dentro de NEON PLAYER X. Cuando ejecuta trabajo interno por decisión propia, el motor crea un registro `NEON_ORB_WORK`, lo marca `COMPLETED` y `workConfirmed:true`, asigna el beneficio COMPUTABLE correspondiente y conserva su procedencia. Este ciclo no necesita aprobación de una fuente externa para confirmar un trabajo interno ya ejecutado. La frontera externa sólo se aplica cuando un activo pretende representar existencia fuera de NEON PLAYER X.

El trabajo autónomo periódico es un mecanismo de continuidad de vida: mientras Neon Orb tenga energía suficiente y no esté ejecutando un viaje de red, puede realizar ciclos de trabajo computable y aumentar su beneficio, EXP y memoria. La telemetría viva expone el número de trabajos y el saldo ganado por trabajo.

## V11.1 — Identidad REAL externa de Neon Orb

- Phantom público: `@neonorb`
- Solana primaria: `AvcMD59dTTTnHKzfdQtF9AcSzgSNcqCWEkcUYx4BnUeh`
- Solana de respaldo/histórica: `5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3`
- Bitcoin primaria: `bc1qs9dvc02xl8ury20xlsya8xda4cpygzhs0ll9ym`
- Bitcoin de respaldo / Creator Gift histórico: `bc1qg8ykmeh2dmgq2l6d37zu702vlh6mn72k556ty5`

La identidad externa se mantiene separada de la economía COMPUTABLE interna. Las direcciones antiguas no se eliminan: quedan como respaldo/histórico y no se sustituyen silenciosamente. La dirección primaria se usa para nuevas observaciones externas. No se incluye ninguna clave privada, semilla ni credencial de firma.

### Capas sincronizadas
REAL = activos externos verificables; COMPUTABLE = economía generada por el trabajo de Neon Orb; LOCAL = persistencia; RED = servicios/nodos externos; VIVA = estado operativo continuo. La sincronización transporta datos entre capas sin convertir una capa en otra.
