# Render.com deployment for Express backend

## 1. Crear servicio en Render

- Ve a https://render.com y crea una cuenta (si no tienes).
- Haz clic en "New +" > "Web Service".
- Conecta tu repositorio de GitHub.
- Elige el directorio `server` como raíz del servicio.
- Elige Node.js como entorno.
- Build Command: `npm install`
- Start Command: `node index.js` (o `node dist/index.js` si usas build)
- Elige la rama principal (main/master).

## 2. Variables de entorno

Agrega las siguientes variables en Render:
- SUPABASE_URL
- SUPABASE_ANON_KEY
- (Cualquier otra que uses en tu backend)

## 3. Puerto
Render usa la variable de entorno `PORT` automáticamente, tu backend ya la soporta.

## 4. Subir cambios y desplegar
Haz push a GitHub y Render desplegará automáticamente.

## 5. Obtener la URL pública
Cuando el deploy termine, Render te dará una URL como:
https://subdireccion-backend.onrender.com

## 6. Configurar el frontend
En `client/.env` pon:
VITE_API_URL="https://subdireccion-backend.onrender.com"

Haz deploy del frontend en Vercel (o actualiza la variable de entorno en Vercel si la usas ahí).

---

## Troubleshooting
- Si tienes errores de CORS, avísame y te ayudo a ajustar el backend.
- Si usas TypeScript y build, asegúrate de que el start command apunte al archivo correcto.
