# Documentación Técnica

Este proyecto es una aplicación administrativa para gestión educativa. Utiliza React, TypeScript, Express, Vite, TailwindCSS y Drizzle ORM.

## Estructura
- **client/**: Frontend React
- **server/**: Backend Express
- **shared/**: Tipos y esquemas compartidos
- **attached_assets/**: Imágenes y HTML
- **script/**: Scripts de construcción

## Instalación
1. `npm install`
2. `npm run dev` para desarrollo
3. `npm run build` para producción

## Pruebas
Se recomienda implementar tests en `client/src/__tests__` y `server/__tests__` usando Jest y Testing Library.

## Mejora de assets
Organizar imágenes en subcarpetas por tipo dentro de `attached_assets/`.

## Seguridad
Revisar validaciones y sanitización de datos en rutas backend.

## Logging y errores
Centralizar logs y mejorar mensajes de error en el backend.

---

# Documentación de Usuario

Accede a la app vía navegador en modo desarrollo o producción. Consulta módulos según permisos y roles.
