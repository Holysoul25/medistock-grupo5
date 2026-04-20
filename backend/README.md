# MEDISTOCK — Backend API REST

API REST para el sistema de gestión de inventario médico MEDISTOCK.

## Tecnologías
- **Node.js** + **Express**
- **MySQL** (mysql2)
- **JWT** para autenticación
- **bcryptjs** para hash de contraseñas

## Instalación

```bash
cd backend
npm install
cp .env.example .env
# Editar .env con tus credenciales
npm run dev
```

## Endpoints principales

| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| GET | /api/v1/productos | Listar productos | ✅ |
| GET | /api/v1/productos/:codigo | Obtener producto + stock | ✅ |
| POST | /api/v1/productos | Crear producto | admin/ejecutivo |
| POST | /api/v1/usuarios/register | Registrar usuario | ❌ |
| POST | /api/v1/usuarios/login | Login | ❌ |
| GET | /api/v1/usuarios/me | Perfil propio | ✅ |
| GET | /api/v1/pedidos | Listar pedidos | admin/ejecutivo |
| POST | /api/v1/pedidos | Crear pedido | ✅ |
| GET | /api/v1/pedidos/:id | Ver pedido | ✅ |
| PATCH | /api/v1/pedidos/:id/estado | Actualizar estado | admin/operador |
| POST | /api/v1/pagos/:id_pedido/procesar | Procesar pago | ✅ |
| POST | /api/v1/logistica/:id_pedido/envio | Generar envío | admin/operador |
| GET | /api/v1/logistica/tracking/:codigo | Consultar tracking | ✅ |

## Roles del sistema
- `admin` — Acceso total
- `ejecutivo` — Gestión de productos y pedidos B2B
- `operador` — Despacho y logística
- `analista` — Solo lectura
- `cliente_b2b` — Clínicas/hospitales
- `cliente_b2c` — Pacientes particulares

## Estructura del proyecto
```
backend/
├── src/
│   ├── config/       → DB y variables de entorno
│   ├── controllers/  → Lógica de entrada HTTP
│   ├── middlewares/  → Auth, roles, errores
│   ├── models/       → Acceso a base de datos
│   ├── routes/       → Definición de endpoints
│   ├── services/     → Lógica de negocio
│   └── utils/        → Respuestas y logger
├── tests/
├── app.js
├── server.js
└── .env.example
```
