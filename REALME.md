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
