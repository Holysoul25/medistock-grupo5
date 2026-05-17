# 🏥 Medistock

Sistema de gestión de inventario y ventas para distribuidoras de productos médicos. Permite administrar productos, procesar pedidos con despacho vía Shipit y pagos en línea con Webpay (Transbank).

---

## Stack tecnológico

### Frontend
| Tecnología | Versión |
|---|---|
| Angular | 17.3 |
| TypeScript | 5.x |
| SCSS | — |
| Angular Router | 17.3 |
| RxJS | 7.x |

### Backend
| Tecnología | Versión |
|---|---|
| Node.js | 18+ |
| Express | 4.19 |
| MySQL2 | 3.9 |
| JSON Web Token | 9.0 |
| bcryptjs | 2.4 |
| Transbank SDK | 6.1 |
| Axios | 1.15 |

### Base de datos
| Tecnología | Detalle |
|---|---|
| MySQL | Base de datos relacional principal |

### Integraciones externas
| Servicio | Uso |
|---|---|
| **Shipit** | Cotización y despacho de pedidos (logistics API) |
| **Webpay (Transbank)** | Procesamiento de pagos en línea |

---

## Estructura de carpetas

### Frontend (`/frontend`)

```
src/
└── app/
    ├── core/                        # Lógica transversal de la app
    │   ├── guards/
    │   │   ├── auth.guard.ts        # Protege rutas autenticadas
    │   │   ├── guest.guard.ts       # Redirige si ya está logueado
    │   │   └── role.guard.ts        # Control de acceso por rol
    │   ├── interceptors/
    │   │   └── jwt.interceptor.ts   # Agrega token Bearer a cada request
    │   ├── models/                  # Interfaces TypeScript
    │   │   ├── logistica.model.ts
    │   │   ├── pago.model.ts
    │   │   ├── pedido.model.ts
    │   │   ├── producto.model.ts
    │   │   └── usuario.model.ts
    │   └── services/                # Servicios HTTP
    │       ├── auth.service.ts
    │       ├── cart.services.ts
    │       ├── comuna.service.ts
    │       ├── logistica.service.ts
    │       ├── pago.service.ts
    │       ├── pedido.service.ts
    │       ├── producto.service.ts
    │       ├── toast.service.ts
    │       └── usuario.service.ts
    │
    ├── modules/                     # Módulos lazy-loaded por dominio
    │   ├── admin/
    │   │   └── usuarios/            # Gestión de usuarios (solo admin)
    │   ├── auth/
    │   │   └── login/               # Pantalla de inicio de sesión
    │   ├── pagos/
    │   │   └── confirmar-pago/      # Retorno de Webpay
    │   ├── pedidos/
    │   │   ├── detalle-pedido/
    │   │   ├── lista-pedidos/
    │   │   └── nuevo-pedido/        # Carrito + checkout + Shipit
    │   ├── productos/
    │   │   ├── catalogo/            # Catálogo con modo B2C / B2B
    │   │   └── producto-detalle/
    │   ├── reportes/
    │   │   └── dashboard/           # Dashboard analítico (admin/analista)
    │   └── usuarios/
    │       └── perfil/              # Perfil del usuario logueado
    │
    └── shared/                      # Componentes reutilizables
        ├── components/
        │   ├── stat-card/           # Tarjeta de estadística
        │   └── toast/               # Notificaciones
        └── layout/
            ├── bottom-nav/          # Navegación inferior mobile
            └── navbar/              # Barra superior
```

### Backend (`/backend`)

```
├── app.js                           # Configuración de Express y middlewares
├── server.js                        # Entry point (listen)
└── src/
    ├── config/
    │   ├── db.js                    # Pool de conexiones MySQL
    │   └── env.js                   # Variables de entorno
    │
    ├── controllers/                 # Manejo de request/response
    │   ├── logisticaController.js
    │   ├── pagoController.js
    │   ├── pedidoController.js
    │   ├── productoController.js
    │   └── usuarioController.js
    │
    ├── integrations/                # Clientes de APIs externas
    │   ├── shipitClient.js          # Integración con Shipit
    │   └── webpay.js                # Integración con Transbank Webpay
    │
    ├── middlewares/
    │   ├── auth.js                  # Verificación de JWT
    │   ├── errorHandler.js          # Manejo centralizado de errores
    │   ├── requireRole.js           # Guard de rol en rutas
    │   └── validateRole.js          # Validación de valores de rol
    │
    ├── models/                      # Acceso a datos (raw SQL)
    │   ├── Pago.js
    │   ├── Pedido.js
    │   ├── Producto.js
    │   ├── Stock.js
    │   └── Usuario.js
    │
    ├── routes/                      # Definición de endpoints
    │   ├── comunasRoutes.js
    │   ├── logisticaRoutes.js
    │   ├── pagoRoutes.js
    │   ├── pedidoRoutes.js
    │   ├── productoRoutes.js
    │   ├── usuarioRoutes.js
    │   └── index.js                 # Router principal
    │
    ├── services/                    # Lógica de negocio
    │   ├── logisticaService.js
    │   ├── pagoService.js
    │   ├── pedidoService.js
    │   ├── productoService.js
    │   └── usuarioService.js
    │
    └── utils/
        ├── logger.js                # Logger de peticiones
        └── response.js              # Helper de respuestas JSON estandarizadas
```

---

## Roles del sistema

| Rol | Acceso |
|---|---|
| `admin` | Todo: productos, pedidos, reportes, gestión de usuarios |
| `analista` | Reportes y dashboard |
| `ejecutivo` | Productos y pedidos (modo B2B) |
| `operador` | Productos y pedidos |
| `cliente` | Catálogo y sus propios pedidos |

---

## Estrategia de ramas

```
main
 └── develop
      ├── feature/auth
      ├── feature/productos
      ├── feature/pedidos
      ├── feature/pagos-webpay
      ├── feature/logistica-shipit
      ├── feature/reportes
      └── fix/<descripcion-del-bug>
```

| Rama | Propósito |
|---|---|
| `main` | Código estable listo para producción |
| `develop` | Integración continua de features en desarrollo |
| `feature/*` | Desarrollo de una funcionalidad específica |
| `fix/*` | Corrección de bugs encontrados en develop o main |

### Flujo de trabajo

1. Crear rama desde `develop`: `git checkout -b feature/nombre`
2. Desarrollar y hacer commits descriptivos
3. Abrir Pull Request hacia `develop`
4. Revisión de código antes de mergear
5. Cuando `develop` está estable, merge a `main` para release

---

## Variables de entorno

### Backend (`.env`)

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=medistock
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES_IN=8h
SHIPIT_API_KEY=
TRANSBANK_COMMERCE_CODE=
TRANSBANK_API_KEY=
TRANSBANK_ENV=integration
```

---

## Instalación y ejecución

### Backend

```bash
cd backend
npm install
npm run dev       # desarrollo con nodemon
npm start         # producción
npm test          # tests con Jest
```

### Frontend

```bash
cd frontend
npm install
ng serve          # http://localhost:4200
ng build          # build de producción
```

---

## Arquitectura general

```
Cliente (Angular 17)
       │
       │  HTTP + JWT
       ▼
API REST (Express + Node.js)
       │
       ├──► MySQL (datos principales)
       ├──► Shipit API (logística y despacho)
       └──► Webpay Transbank (pagos)
```
