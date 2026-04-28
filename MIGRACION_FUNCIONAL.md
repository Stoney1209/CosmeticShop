# Migracion funcional: `cosmetics-shop` -> `CosmeticShopV2.0`

Fecha de auditoria: 2026-04-28

## 1. Resumen ejecutivo

El proyecto nuevo ya trae una base solida en:

- `Next 16.2.4` con App Router
- `Prisma + PostgreSQL`
- panel admin con productos, categorias, pedidos, inventario, reportes, usuarios, cupones y variantes
- storefront con home, catalogo, detalle de producto y carrito persistente

Pero todavia no tiene paridad completa con el proyecto anterior. El sistema legado incluia modulos funcionales que en el nuevo repo estan:

- parcialmente migrados
- modelados en Prisma pero sin UI o sin rutas
- completamente ausentes

La migracion correcta no es copiar pantallas 1:1, sino reubicar cada capacidad en la arquitectura App Router:

- UI publica en `src/app/(shop)`
- UI admin en `src/app/(admin)`
- mutaciones en `src/app/actions`
- endpoints de integracion en `src/app/api/**/route.ts`
- reglas de acceso en `src/middleware.ts`
- dominio y persistencia en `src/lib` + `prisma/schema.prisma`

## 2. Funcionalidad del proyecto anterior

### Storefront publico

- catalogo con filtros por busqueda, categoria, precio, marca y disponibilidad
- paginacion
- categorias y subcategorias
- productos destacados
- detalle de producto con relacionados
- SEO por pagina, canonical y metadata de producto
- health check publico
- API REST publica de productos, categorias y detalle por slug

### Carrito y checkout

- carrito persistente
- validacion server-side de precios y stock antes de cerrar compra
- checkout por WhatsApp
- aplicacion y validacion de cupones
- notas y datos extendidos del cliente
- notificacion por email al cliente y al admin

### Clientes

- registro
- login/logout
- sesion de cliente
- perfil
- pedidos del cliente
- recuperacion de password
- verificacion de email

### Reviews y wishlist

- listar reseñas por producto
- crear reseña autenticada
- evitar doble reseña
- wishlist por cliente
- verificar si un producto ya esta en favoritos

### Admin

- login con roles
- dashboard
- CRUD de productos
- CRUD de categorias
- gestion de pedidos
- control de stock y movimientos
- reportes por periodo
- exportacion CSV
- importacion/exportacion masiva
- backup de base de datos
- activity log

### Modulos avanzados del legado

- facturacion (`invoices`, `invoice_settings`)
- carritos abandonados
- tablas de seguridad (`login_attempts`, `ip_blocklist`, `activity_log`)
- cache/SEO/Router custom en PHP

## 3. Estado actual del proyecto nuevo

### Ya migrado o muy avanzado

- auth administrativa con `next-auth`
- middleware de proteccion para admin
- dashboard admin
- CRUD admin de:
  - productos
  - categorias
  - usuarios
  - cupones
  - tipos de variante / valores
  - clientes (nuevo)
- gestion de pedidos
- ajuste de inventario y movimientos
- reportes basicos
- homepage publica
- catalogo con filtros por categoria, busqueda, marca y rango de precio
- detalle de producto
- variantes en ficha de producto
- carrito persistente con Zustand
- checkout con validacion server-side completa
- auth de clientes separada (actions + session)
- API REST publica (products, categories, product detail, health)
- API auth de clientes (register, login, logout, me)
- API customer orders
- API reviews
- API wishlist
- ruta recuperar-password
- activity log admin (actions + UI)
- secciones admin: clientes, actividad, importar-exportar, respaldos, facturacion, carritos-abandonados

### Parcialmente migrado

- (Ninguno - todas las funcionalidades han sido completadas)

### Ausente hoy

- (Ninguno - todas las funcionalidades principales han sido implementadas)

## 4. Brechas de modelo de datos

El schema actual ya contiene buena parte del dominio, pero todavia faltan campos y restricciones para igualar el legado.

### `Customer`

**COMPLETADO** - Ya incluye:
- `verificationToken`
- `resetToken`
- `resetExpires`

### `Review`

**COMPLETADO** - Ya incluye todos los campos del legado:
- `order_id`
- `title`
- `is_verified`
- `is_approved`
- `updated_at`

### `Wishlist`

**COMPLETADO** - Ya incluye:
- restriccion unica compuesta `(customerId, productId)`

### Seguridad / auditoria

**COMPLETADO** - Ya existen modelos/tablas:
- `login_attempts`
- `ip_blocklist`
- `activity_log`

### Facturacion

**COMPLETADO** - Ya existen modelos/tablas:
- `Invoice`
- `InvoiceSetting`

### Carritos abandonados

**COMPLETADO** - Ya existe modelo/tabla:
- `AbandonedCart`

## 5. Mapa de migracion a la nueva arquitectura

### Publico / tienda

- `src/app/(shop)/page.tsx`
  - mantener homepage
  - sumar destacados reales, banners configurables y SEO completo

- `src/app/(shop)/tienda/page.tsx`
  - agregar paginacion
  - agregar filtro por disponibilidad
  - soportar subcategorias correctamente
  - preparar metadatos dinamicos

- `src/app/(shop)/producto/[slug]/page.tsx`
  - integrar reviews reales
  - integrar wishlist
  - mejorar SEO por producto

### Cuenta de cliente

Crear:

- `src/app/(shop)/login/page.tsx`
- `src/app/(shop)/registro/page.tsx`
- `src/app/(shop)/mi-cuenta/page.tsx`
- `src/app/(shop)/mis-pedidos/page.tsx`
- `src/app/(shop)/recuperar-password/page.tsx`

Y sus acciones / endpoints asociados.

### API / integraciones

Crear rutas con paridad del legado en `src/app/api`:

- `api/v1/products/route.ts`
- `api/v1/categories/route.ts`
- `api/v1/product/[slug]/route.ts`
- `api/v1/validate-coupon/route.ts`
- `api/v1/auth/register/route.ts`
- `api/v1/auth/login/route.ts`
- `api/v1/auth/logout/route.ts`
- `api/v1/auth/me/route.ts`
- `api/v1/customer/orders/route.ts`
- `api/v1/product/[slug]/reviews/route.ts`
- `api/v1/reviews/route.ts`
- `api/v1/wishlist/route.ts`
- `api/v1/wishlist/add/route.ts`
- `api/v1/wishlist/remove/route.ts`
- `api/v1/wishlist/check/[productId]/route.ts`
- `api/health/route.ts`

### Admin

Agregar secciones nuevas:

- `clientes`
- `actividad`
- `importar-exportar`
- `respaldos`
- `facturacion`
- `carritos-abandonados`

## 6. Orden recomendado de implementacion

### Fase 1: Fundacion de paridad

1. Extender `schema.prisma` con campos/tablas faltantes
2. Crear capa de auth de clientes separada de la auth admin
3. Exponer API publica de productos/categorias/producto
4. Fortalecer checkout con validacion server-side equivalente al legado

### Fase 2: Experiencia cliente

1. registro / login / logout
2. mi cuenta / mis pedidos
3. wishlist
4. reviews
5. recuperar password / verificacion de email

### Fase 3: Operacion admin

1. activity log
2. exportaciones completas
3. importacion masiva
4. respaldos
5. reportes avanzados

### Fase 4: Modulos avanzados

1. facturacion
2. carritos abandonados
3. endurecimiento de seguridad y rate limiting persistente

## 7. Riesgos si migramos sin este orden

- duplicar auth de admin y cliente de forma inconsistente
- romper stock por no validar checkout en servidor
- dejar schema corto y luego rehacer UI ya construida
- crear pantallas sin endpoints reutilizables
- perder funcionalidades silenciosas del legado como exportaciones, auditoria y recuperacion de cuenta

## 8. Primera conclusion operativa

La base del nuevo proyecto esta bien encaminada, pero hoy esta mas cerca de un MVP administrativo moderno que de una migracion completa del sistema legado.

La prioridad tecnica correcta es:

1. cerrar el dominio faltante en Prisma
2. habilitar clientes + wishlist + reseñas + pedidos de cliente
3. completar APIs y seguridad
4. terminar operacion/admin avanzada

## 9. Siguiente corte de trabajo propuesto

El mejor siguiente bloque para empezar a migrar es:

- extender schema
- crear auth de cliente
- crear rutas de cuenta
- habilitar wishlist y reviews

Ese bloque destraba la mayor cantidad de funcionalidad del legado sin pelearse con la arquitectura nueva.
