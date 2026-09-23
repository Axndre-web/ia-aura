# NEON PLAYER X — Node.js production packaging

## Estructura
- `public/`: interfaz estática existente, trasladada sin cambios de contenido.
- `core/`, `integrations/`, `tests/`: lógica y pruebas del proyecto.
- `server.js`: servidor Express con Helmet + compression + health check.
- `package.json`: dependencias y comandos de producción.

## Arranque
```bash
npm install
npm start
```

Por defecto escucha en `0.0.0.0:3000`. Puedes cambiarlo con `PORT` y `HOST`.

## Seguridad
Este paquete de despliegue **no incluye** `.env`, `keypair.json`, `keypair.js`, `general.js` ni `__pycache__`.
El archivo original contenía material sensible de wallet/credenciales; no debe desplegarse ni publicarse. Si ese material correspondía a una wallet real, debe considerarse comprometido y rotarse antes de producción.

El servidor solo expone `public/` y `/healthz`; la lógica privada no queda publicada como archivos estáticos.
