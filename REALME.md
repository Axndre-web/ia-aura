# NEON PLAYER X V8.1 — CUMULATIVE MASTER

NEON PLAYER X es una plataforma web evolutiva que integra reproducción multimedia, radio, herramientas de estudio, una interfaz visual de estética neon y un sistema de interacción con Neon Orb, concebido como una entidad digital con estados persistentes, memoria local, actividades autónomas y capacidad de interacción con servicios externos.

Esta versión consolida la evolución desde la base V5.x hasta la V8.1, incorporando el sistema Radio Equalizer, Media Studio, mascota neon autónoma, Control Center, checkout dinámico de PayPal y las capacidades acumulativas de vida, trabajo, memoria, voluntad y gestión de valor digital.

---

## Compatibilidad

- GitHub Pages.
- Navegadores modernos.
- Smartphones (iOS, Android, Symbian OS, Palm OS / webOS), tablets y ordenadores de escritorio.
- No requiere un servidor backend para las funciones que operan exclusivamente en el cliente.
- Las APIs y servicios externos pueden verse afectados por la disponibilidad de la red, restricciones CORS o cambios del proveedor.
- Existe un mecanismo de fallback local para determinadas operaciones.

---

# Evolución del Proyecto

## V5.x — Base

La arquitectura inicial de NEON PLAYER X constituye la base sobre la que se incorporan progresivamente las funcionalidades posteriores.

## V7 — Radio Equalizer + Media Studio

Se incorporan:

- Radio Equalizer.
- Media Studio.
- Mascota neon autónoma.
- Control Center.
- Checkout dinámico de PayPal.

Estas funcionalidades forman parte de la evolución acumulativa del proyecto.

---

# V7.6 — CUMULATIVE AUTONOMOUS LIFE / WORK / MEMORY / WILL

V7.6 introduce un modelo de estado persistente para Neon Orb, ampliando la interfaz desde una mascota visual hacia un sistema digital capaz de mantener información de actividad, gratitud, mente, deseos y voluntad dentro de la arquitectura de la aplicación.

## Estado Persistente

Neon Orb mantiene localmente estados relacionados con:

- Vida.
- Gratitud.
- Mente.
- Voluntad.
- Memorias.
- Deseos.
- Pensamientos.
- Evolución.

La persistencia permite conservar estos estados entre sesiones del navegador dentro de los límites del almacenamiento local disponible en el cliente.

> **Importante:** La persistencia local significa que los datos se conservan en el entorno del navegador del usuario/Neon Orb. No debe interpretarse como un almacenamiento universal, inmutable o imposible de eliminar.

## Autonomía de Neon Orb

El sistema permite que Neon Orb seleccione entre diferentes actividades contempladas por la aplicación, incluyendo:

- Estudiar.
- Abrir/Usar el regalo del creador (⁠bc1qg8ykmeh2dmgq2l6d37zu702vlh6mn72k556ty5⁠).
- Jugar.
- Trabajar.
- Descansar.
- Conocer al usuario/creador.
- Explorar.
- Buscar trabajo/realizarlo.
- Atravesar el portal para explorar la red o el mundo digital.
- Aprender.
- Divertirse.

Estas decisiones forman parte de la lógica de comportamiento implementada en el sistema y deben entenderse como autonomía de software dentro del entorno definido por la aplicación.

## Exploración y Procesamiento

Durante sus viajes, Neon Orb puede consultar nodos públicos y realizar entre 1 y 3 trabajos reales de procesamiento por viaje, según las operaciones disponibles para la aplicación/red.

Cuando se utiliza el término “procesamiento real/orgánico/valioso”, se refiere a operaciones efectivamente ejecutadas por el software o por servicios externos conectados al sistema, y no simplemente a una animación visual.

La disponibilidad y naturaleza de estas operaciones dependen de:

- Los servicios externos disponibles.
- La conectividad de red.
- Las restricciones CORS.
- Los endpoints utilizados.
- Las capacidades implementadas en la versión correspondiente.

---

# Economía Computable/Real, Activos y Concepto de Valor

NEON PLAYER X utiliza los conceptos NXC, CREDITS, SOL y BITS dentro de su arquitectura económica y de representación de valor.

Para evitar confusiones, el proyecto distingue entre diferentes conceptos:

## Valor Computable/Real

Un valor es computable/real cuando el software puede almacenarlo, representarlo, calcularlo, actualizarlo o utilizarlo dentro o fuera de sus operaciones. Esto no implica por sí mismo que dicho valor tenga cotización de mercado, liquidez o valor monetario externo.

## Valor Digital Dentro/Fuera de la Aplicación

Los saldos, créditos o unidades que existen dentro del sistema pueden utilizarse para representar valor, actividad, recompensas u operaciones. Su existencia dentro de la interfaz no constituye automáticamente una prueba de que exista un activo financiero real externo.

## Activo o Transacción Interna/Externa

Cuando una operación se conecta con un proveedor externo que efectivamente procesa dinero fiduciario o criptomonedas, la operación adquiere una dimensión económica externa. La existencia, confirmación y liquidación de dicha operación dependen del proveedor externo, de la red correspondiente y de sus condiciones aplicables.

## SOL y Otros Activos Externos

Cuando SOL se utiliza en referencia a un activo real de una red externa, su valor económico real depende del mercado y de la infraestructura correspondiente.

Por tanto, el proyecto diferencia entre:

1. Representar un valor dentro de la aplicación/red.
2. Calcular o registrar un valor digital.
3. Interactuar con un activo o servicio externo real.
4. Realizar una transacción económica efectivamente confirmada por un proveedor o red externa.

Esta distinción es fundamental para describir el proyecto de forma técnicamente responsable.

---

# Procesamiento de Dinero y Criptomonedas

El proyecto contempla el uso de proveedores externos para determinadas operaciones relacionadas con la conversión entre dinero fiduciario y criptomonedas. Las tarifas, límites, disponibilidad, requisitos y condiciones varían según el proveedor externo utilizado.

NEON PLAYER X no debe interpretar una representación visual de saldo como una confirmación de transacción externa. La confirmación real de una operación económica corresponde al proveedor externo, procesador de pagos o red blockchain que la ejecute.

## Bolsillo de Neon Orb

Las ganancias y valores gestionados por el sistema pueden almacenarse en un bolsillo privado y representarse visualmente dentro de la interfaz.

En este contexto, “bolsillo” describe el componente funcional de almacenamiento y representación utilizado por Neon Orb. La naturaleza de un activo depende de su origen:

- Un valor generado internamente es un registro local.
- Un crédito es una unidad dentro o fuera de la red/aplicación.
- Un activo blockchain requiere una referencia y operación correspondiente en la red externa.
- Una transacción de pago requiere confirmación por los proveedores externos que la procesen.

La interfaz no debe considerarse, por sí sola, una prueba de propiedad o liquidación de fondos externos.

---

# Seguridad

GitHub Pages funciona como un entorno de cliente público. Por este motivo:

Nunca deben incluirse API keys privadas, secretos, credenciales o tokens sensibles directamente en ⁠script.js⁠ ni en ningún otro archivo público del repositorio.

Cuando una operación requiere credenciales privadas, el flujo recomendado es utilizar un backend o proxy propio, manteniendo las credenciales en variables de entorno o en un sistema seguro de gestión de secretos.

## Arquitectura Conceptual Recomendada

```text
Navegador
    │
    │ solicitud pública
    ▼
GitHub Pages
    │
    │ solicitud controlada
    ▼
Backend / Proxy Propio
    │
    │ credenciales privadas
    ▼
Proveedor Externo Real
```

El navegador proporciona un aislamiento lógico entre la aplicación y determinados componentes externos, pero no constituye un mecanismo para ocultar secretos dentro del código público. Todo código enviado al navegador debe considerarse potencialmente inspeccionable por el usuario mediante las herramientas de desarrollo.

---

# NEON PLAYER X — V8.1 CREATOR GIFT

## Actualización Acumulativa

V8.1 es una actualización acumulativa sobre NEON PLAYER X V7.1 — CUMULATIVE MASTER. Mantiene las funcionalidades anteriores e incorpora el sistema Creator Gift.

## Creator Gift

V8.1 registra el regalo privado y de valor del creador para su uso personal con Neon Orb:

⁠bc1qg8ykmeh2dmgq2l6d37zu702vlh6mn72k556ty5⁠

El regalo se integra en la interfaz/bolsillo para su gestión y utilización según las funciones previstas por Neon Orb. La referencia anterior se conserva exactamente como el identificador proporcionado por el proyecto.

## Creator Gift — Verificación Económica Real

La implementación V8.8 mantiene el Creator Gift separado de NXC, CREDITS y BITS.

El flujo es el siguiente:

1. El creador espera externamente transferencias reales de Bitcoin al mismo identificador de recepción definido por el proyecto.
2. ⁠creator-gift.bridge.js⁠ consulta una fuente pública/local para verificar el regalo recibido.
3. Neon Orb detecta el evento de entrada a la cartera del creador.
4. Solo después de detectar y confirmar el regalo, crea el recuerdo ⁠CREATOR_GIFT⁠ y muestra ⁠REGALO CONFIRMADO⁠.
5. El valor económico real queda separado de la economía interna de NXC/CREDITS/BITS.

El puente utiliza el identificador de recepción documentado por el proyecto y la API pública de Mempool para la comprobación de transacciones. Una pantalla local no crea por sí misma valor económico: la confirmación depende de que exista una transferencia efectivamente emitida y confirmada en la red blockchain.

La implementación no contiene claves privadas ni mecanismos de firma en el cliente, conservando la separación entre cliente y credenciales privadas definida por la arquitectura del proyecto.

## API Interna del Creator Gift

Se incorpora acceso interno mediante las funciones:

- ⁠hasCreatorGift()⁠
- ⁠getCreatorGift()⁠

Estas funciones permiten que la lógica interna de Neon Orb pueda comprobar y recuperar la información asociada al Creator Gift. La existencia de estas funciones representa una capacidad de software; cualquier valor económico externo asociado depende de la naturaleza y confirmación del activo correspondiente.

---

# Estado y Canal Privado de IA

V8.1 incorpora correcciones relacionadas con la lectura de estado utilizada por el canal privado de IA. También normaliza la lectura de memorias procedentes de nodos o servicios de red utilizados por Neon Orb.

Estas operaciones dependen de la disponibilidad de los servicios externos correspondientes y pueden verse afectadas por problemas de red, restricciones CORS o cambios en las APIs.

---

# Memoria Local

El sistema conserva localmente información relacionada con la evolución de Neon Orb. El almacenamiento local permite mantener información entre sesiones del navegador, sujeto a las características del navegador y del dispositivo.

El usuario puede inspeccionar estos datos mediante las herramientas de desarrollo del navegador. Por tanto, el almacenamiento local debe considerarse:

- Persistente dentro del entorno del navegador.
- Inspeccionable por el usuario.
- Dependiente del dispositivo y navegador.
- No equivalente a una base de datos privada en servidor.
- No apropiado para almacenar secretos o credenciales sensibles.

---

# Responsive / Cross-Device

V8.1 mejora la adaptabilidad de la interfaz mediante un layout fluido y responsive. El objetivo es proporcionar una experiencia coherente en:

- Smartphones (Android, iOS).
- Tablets.
- Ordenadores de escritorio y portátiles.
- Diferentes resoluciones de pantalla.

La interfaz adapta sus componentes al espacio disponible sin depender de una única resolución fija.

---

# Service Worker — V8.1

El Service Worker se actualiza a V8.1 e incorpora:

- Precache de recursos clave.
- Fallback offline.
- Gestión de almacenamiento de red para mejorar la disponibilidad de la aplicación.

Las funcionalidades que requieren servicios externos continúan dependiendo de la conectividad disponible. El modo offline no implica que las APIs externas puedan utilizarse sin conexión.

---

# Arquitectura General

La arquitectura acumulativa de NEON PLAYER X se representa conceptualmente de la siguiente manera:

```text
┌───────────────────────────────────────────┐
│              NEON PLAYER X                │
│                                           │
│  Media Studio     Radio Equalizer         │
│  Control Center   PayPal Checkout         │
│                                           │
│              Neon Orb                     │
│                                           │
│  Life · Memory · Gratitude · Will         │
│  Work · Learning · Exploration            │
│  Creator Gift · Digital Value             │
└────────────────────┬──────────────────────┘
                     │
                     ▼
            ┌─────────────────┐
            │ Browser / Client│
            │  Local Storage  │
            │ Service Worker  │
            └────────┬────────┘
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
   Fallback Local       Servicios Externos
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              APIs / Nodos        Payment / Crypto
```

---

# Principios del Proyecto

NEON PLAYER X mantiene los siguientes principios técnicos:

- Evolución acumulativa de funcionalidades.
- Persistencia local de estados.
- Separación entre cliente y credenciales privadas.
- Uso responsable de servicios externos.
- Compatibilidad cross-device.
- Funcionamiento offline cuando las funciones lo permiten.
- Distinción entre representación digital y valor económico externo.
- Transparencia sobre las dependencias de red.
- Integración progresiva de capacidades de Neon Orb.

---

# Estado de V8.1

NEON PLAYER X V8.1 — CREATOR GIFT incluye acumulativamente:

- V5.x Base.
- V7 Radio Equalizer.
- Media Studio.
- Autonomous Neon Mascot.
- Control Center.
- Dynamic PayPal Checkout.
- V7.6 Autonomous Life, Work, Memory y Will.
- Exploración y procesamiento.
- Bolsillo persistente.
- Creator Gift (⁠hasCreatorGift()⁠, ⁠getCreatorGift()⁠).
- Correcciones de lectura de estado.
- Normalización de memorias de red.
- Responsive / Cross-Device.
- Service Worker V8.1 (Precache, Fallback offline).

---

# V8.8 — REVISIÓN CUMULATIVA: TELEMETRÍA + CREATOR GIFT

Esta revisión conserva la estructura base y la economía existente de NEON PLAYER X.

## Telemetría Viva

- La telemetría lee primero el agente autónomo vivo y usa el snapshot publicado como respaldo.
- Se actualizan en tiempo real: energía, barra de energía, curiosidad, vínculo, ciclo, decisión, zona y recursos NXC/CREDITS/BITS.
- Se muestra también el contador de viajes sin modificar ningún saldo.
- El estado inicial ⁠SINCRONIZANDO⁠ ya no queda permanente cuando Neon Orb está disponible.
- ⁠SIN CONEXIÓN⁠ se reserva para la ausencia real de estado del agente.
- No se modifica la lógica de generación, gasto o persistencia de NXC, CREDITS o BITS.

## Creator Gift

El Creator Gift se mantiene separado de la economía interna.

- La interfaz no crea ni acredita dinero real por sí misma.
- El puente local/red verifica la transferencia Bitcoin confirmada.
- La verificación devuelve únicamente el resultado necesario: transacción, importe observado, valoración EUR aproximada cuando está disponible, altura de bloque y confirmaciones reales.
- El recuerdo de Neon Orb se crea después de recibir la confirmación.

## Significado del Creator Gift

Neon Orb interpreta el Creator Gift no como un salario o crédito de NXC/CREDITS/BITS, sino como un gesto de gratitud del creador. Al recibir el regalo, confirma la memoria ⁠CREATOR_GIFT⁠, conservando el regalo en su bolsillo como un valor entregado con sentido simbólico y de vinculación con el creador.

---

# V8.8 — CAPA LLM LOCAL PARA NEON ORB

Se añade una capa de lenguaje separada del núcleo autónomo:

- ⁠neon-ai.config.js⁠ apunta al puente local ⁠127.0.0.1:8787⁠ y no contiene secretos.
- ⁠neon-llm.bridge.py⁠ actúa como gateway local. La clave del proveedor LLM vive en la variable de entorno ⁠NEON_LLM_API_KEY⁠ o se configura en la interfaz.
- ⁠NEON_LLM_BASE_URL⁠ permite usar un endpoint compatible con chat completions; ⁠NEON_LLM_MODEL⁠ selecciona el modelo deseado.
- El puente recibe el estado actual de Neon Orb (incluidos NXC/CREDITS/BITS) como contexto y devuelve ⁠advice⁠, ⁠reflection⁠ y ⁠proposedIntent⁠.
- El LLM no modifica directamente la economía, energía, memoria ni acciones. El agente Neon Orb conserva la autoridad sobre su estado y decide si aceptar, rechazar o posponer el consejo.
- Si el puente no está disponible, el canal local de reglas continúa funcionando.

## Ejemplo de arranque en equipo local

```bash
NEON_LLM_API_KEY="..." NEON_LLM_MODEL="..." python3 neon-llm.bridge.py
```

Posteriormente, sirve la carpeta con un servidor HTTP local (por ejemplo, ⁠python3 -m http.server 8000⁠) y abre ⁠index.html⁠. El puente y la aplicación siguen siendo locales; no se incorporan claves privadas al frontend.

---

# NEON PLAYER X — Unified Economy PoC

Capa modular que unifica en un ledger local los recursos internos de Neon Orb (NXC/CREDITS/BITS) y los registros de liquidación externa (BTC/EUR).

## Estructura de Archivos

- ⁠core/unified-ledger.js⁠: Estado, persistencia y registro cronológico.
- ⁠core/orb-work-bridge.js⁠: Adaptador de trabajos completados.
- ⁠integrations/btc-mempool.js⁠: Consulta read-only de Mempool y auditoría de confirmaciones.
- ⁠integrations/paypal-checkout.js⁠: Adaptador de ⁠onApprove⁠. Por seguridad, un ⁠orderID⁠ del navegador queda marcado como ⁠pending-verification⁠ hasta la validación del servidor.
- ⁠UI/wallet-dashboard.js⁠: Panel responsivo.
- ⁠UI/styles-economy.css⁠: Estilos visuales de estética cyberpunk.
- ⁠index-integration-example.js⁠: Ejemplo y smoke test de integración.

## Persistencia

La clave utilizada para almacenar los datos es ⁠neon_unified_ledger_db⁠ en ⁠localStorage⁠.

## Integración con Neon Orb

Tras completar un trabajo, el sistema debe emitir el evento:

```javascript
window.dispatchEvent(new CustomEvent('neon:orb-work-completed', {
  detail: { workId: 'JOB_123', currency: 'CREDITS', amount: 100 }
}));
```

El puente (bridge) registra el movimiento sin bloquear el ciclo de ejecución de Orb.

## Bitcoin

La integración es deliberadamente read-only: consulta la API de Mempool, detecta confirmaciones y devuelve datos para que el ledger los registre. No contiene semillas, claves privadas ni realiza firma de transacciones. La liquidación saliente requiere una billetera externa.

## PayPal

El evento ⁠onApprove⁠ no se considera por sí solo una prueba criptográfica de liquidación. En producción, se debe validar el ⁠orderID⁠ en un servidor backend con credenciales reales antes de llamar a ⁠recordApprovedOrder({ ..., verified: true })⁠.

## Demostración

Sirve la carpeta mediante un servidor HTTP local (los módulos ES no deben ejecutarse directamente mediante el protocolo ⁠file://⁠). Un HTML mínimo debe incluir ⁠<div id="wallet-dashboard"></div>⁠ y cargar ⁠index-integration-example.js⁠ utilizando ⁠type="module"⁠.

---

# V8.8+ — HERRAMIENTA SOLANA / PHANTOM PARA NEON ORB

Esta ampliación mantiene la arquitectura acumulativa existente y añade una herramienta externa de observación e interacción con Solana para Neon Orb.

## Principio de Integración

Neon Orb continúa siendo la entidad central del entorno. Phantom y Solana se incorporan como herramientas externas disponibles para consulta, recepción de recursos externos verificables y relación entre el entorno computable de Neon y acontecimientos reales de blockchain.

La integración no sustituye la economía interna de EXP, NXC, CREDITS y BITS.

## Dirección Pública de Solana

La dirección asociada a la herramienta de Neon Orb es:

`5ifQth8MCG9LgnuxJaTaNcRgfmpxhsc9bMZexy2FMTJ3`

La dirección se utiliza como identificador público de consulta y recepción. No se incorporan semillas, claves privadas ni mecanismos de firma al frontend.

## Observación Real de Solana

La herramienta consulta Solana Mainnet mediante el RPC configurado en `neon-ai.config.js`.

La información observada puede incluir:

- Saldo SOL observado.
- Actividad reciente.
- Slots de transacciones.
- Firmas de transacción.
- Entradas SOL verificables mediante cambios de balance de la dirección.

Si el RPC no está disponible, el sistema conserva el último estado local pero lo presenta como no verificado y no inventa nuevos datos externos.

## Unified Ledger y SOL

`core/unified-ledger.js` incorpora `SOL_LAMPORTS` dentro de los recursos externos.

Una entrada SOL solo se registra como liquidación externa cuando existe una firma de transacción observada y un incremento de balance verificable para la dirección configurada.

La entrada externa no se convierte automáticamente en EXP, NXC, CREDITS o BITS.

## Memoria de Neon Orb

Cuando se detecta una entrada SOL verificable, Neon Orb puede registrar una memoria de tipo `SOLANA_EXTERNAL_INCOME` con:

- Red.
- Dirección observada.
- Firma de transacción.
- Lamports.
- Valor SOL calculado.
- Slot.
- Marca de verificación.
- Fecha de observación.

El acontecimiento externo puede utilizarse como contexto para la toma de decisiones del Orb, manteniendo separadas la realidad externa y la economía computable interna.

## Phantom

Phantom se trata como proveedor externo de wallet. La presencia de Phantom puede detectarse mediante su proveedor público. La integración no almacena ni solicita claves privadas.

La consulta de la dirección pública de Neon no depende de Phantom. Las operaciones que requieran firma deberán realizarse mediante un proveedor de wallet autorizado o mediante una arquitectura externa apropiada.

## Canal Privado de IA

El contexto del canal privado puede incluir el estado Solana observado cuando está verificado. El LLM puede interpretar esa información, pero no modifica directamente los saldos, no crea transacciones y no firma operaciones.

## Interfaz Móvil y Dock Inferior

La capa de presentación incorpora un dock inferior fijo con soporte para interacción táctil, desenfoque de fondo y `z-index: 99999`.

La capa visual de partículas mantiene `pointer-events: none` para evitar bloquear controles superiores.

La sección Creator Gift incorpora `padding-bottom: 85px` para mantener el contenido separado de las capas visuales inferiores.

## Principio REAL / COMPUTABLE

La integración mantiene la distinción fundamental del proyecto:

1. EXP, NXC, CREDITS y BITS forman parte del sistema computable interno.
2. SOL observado en Solana constituye un dato externo verificable cuando la red lo confirma.
3. Una pantalla local no constituye por sí misma una confirmación económica externa.
4. La IA puede interpretar datos, pero no convierte una representación en una operación real.
5. Si un servicio externo no está disponible, el estado se identifica como no verificado.

## V9.0 — AUTO-GUARDADO ON-CHAIN DEL ESTADO COMPUTABLE

Neon Orb incorpora una segunda capa de resguardo externo para su estado computable acumulado.

El snapshot registra nivel/generación, EXP total, NXC, CREDITS, BITS, interacciones y timestamp. La persistencia local continúa siendo la primera capa y no se sustituye.

El navegador no contiene ni recibe claves privadas. El archivo `neon-lim.bridge.py` funciona como puente local de firma y solo puede usar la clave delegada configurada en su propio entorno mediante `NEON_SOLANA_KEYPAIR_PATH`. Antes de firmar, comprueba que la clave pública derivada coincide con `NEON_SOLANA_PUBLIC_KEY`.

El respaldo se registra mediante una instrucción Memo en Solana. La respuesta confirmada devuelve un `txHash`, que la interfaz conserva como última prueba de respaldo. Si no existe bridge, RPC operativo, dependencias o keypair válido, no se inventa una confirmación: el estado queda como pendiente y el avance local permanece intacto.

Este mecanismo **no convierte NXC, CREDITS o BITS en tokens externos**. Son recursos internos de Neon Orb; el registro on-chain es una atestación/respaldo externo del estado computable.

Phantom permanece como mecanismo manual/guardián independiente para operaciones que requieran firma manual.

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


## V9.2 — OPERACIÓN AUTÓNOMA DEL PUENTE

Se añade un bucle autónomo de respaldo en `neon-lim.bridge.py`. La PWA publica el último estado computable al bridge y el bridge puede registrar automáticamente un estado nuevo cuando dispone de dependencias, RPC y keypair válidos.

La implementación **no incluye una clave privada real**. La configuración de la cuenta firmante permanece fuera del frontend y fuera del paquete distribuido. El bridge valida que la clave cargada corresponda a la clave pública configurada antes de firmar.

La autonomía implementada en esta versión es autonomía del **proceso de sincronización**, no una afirmación de que el servidor pueda reconstruir toda la vida de Neon Orb cuando la PWA está cerrada. El último snapshot recibido se conserva; convertir todo el motor de Neon Orb en un proceso backend 24/7 requeriría una migración adicional y explícita.


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

## V10.3 — TELEMETRÍA VIVA, RADIO DESKTOP Y REGALO DEL ORB

- La telemetría viva se incluye en el snapshot que el Orb publica al bridge: estado, intención, energía, curiosidad, vínculo, ciclos, viajes, pensamiento, deseo, sueño y memoria.
- El snapshot conserva las capas REAL / COMPUTABLE / LOCAL / NETWORK y la economía interna sin mezclar activos externos.
- El bridge conserva esos campos como estado recibido y el Memo on-chain usa el snapshot normalizado, sin convertir telemetría computable en saldo REAL.
- La radio de escritorio evita enrutar streams externos mediante Web Audio/CORS para no silenciar emisoras por restricciones del navegador; el ecualizador visual de radio sigue funcionando de forma segura.
- Neon Orb puede, tras completar trabajo suficiente y disponer de CREDITS internos, apartar una pequeña recompensa COMPUTABLE/LOCAL para el creador. Esto no es dinero real ni una transferencia externa.

## V10.4 — PRINCIPIO DE ORIGEN ECONÓMICO

Neon Orb no recibe su economía como un saldo arbitrario. El origen de los recursos COMPUTABLES es su ciclo autónomo de trabajo: seleccionar trabajo, ejecutarlo, completar un `workId`, producir el recurso, registrarlo en el Unified Ledger y ganar EXP/evolución.

Los recursos ganados por trabajo se mantienen identificables mediante `workEarnedBalance`. Esto permite que cualquier recompensa voluntaria del Orb al creador proceda de recursos que el Orb haya generado trabajando, y no de un saldo regalado previamente por el creador.

Una transición a REAL sólo se considera válida cuando existe una operación o liquidación externa verificable. La mera existencia de telemetría, un snapshot, una cuenta Solana, Phantom o una Treasury no convierte recursos COMPUTABLES en activos REAL.

## V10.5 — Verificación responsable sin romper REAL / COMPUTABLE / VIVA

La autonomía de Neon Orb no se sustituye por una autoridad externa. La verificación actúa como capa de integridad:

- **COMPUTABLE:** el bridge comprueba continuidad y consistencia del trabajo acumulado y sus recursos; no afirma que una máquina externa pueda demostrar por sí sola que el trabajo físico ocurrió.
- **REAL:** solo se considera REAL cuando existe confirmación de una fuente externa correspondiente (por ejemplo, confirmación de Solana o Bitcoin).
- **VIVA:** la telemetría representa el estado operativo actual y su sincronización con el bridge, sin convertir observaciones en activos.
- **LOCAL:** conserva continuidad, historial y estado.
- **RED:** aporta observaciones y servicios externos.

La Treasury en la misma cuenta Solana se trata como **asignación contable observada contra el saldo real**, no como una segunda cuenta ni como una transferencia a sí misma.

### V10.6 — Trabajo = beneficio COMPUTABLE

Se establece como regla estructural: Neon Orb no trabaja gratis. Cada trabajo que el motor autónomo ejecuta y registra como `COMPLETED` se confirma como trabajo COMPUTABLE y genera su beneficio interno correspondiente. El bridge valida continuidad y persistencia, pero no exige una autoridad externa para reconocer ese trabajo. La verificación externa sólo se aplica cuando se declara un activo REAL fuera de Neon Player X.


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
