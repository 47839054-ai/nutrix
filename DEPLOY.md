# Guía de deploy — subir Nutrix a Internet (gratis)

Esto hace que **cualquiera** pueda usar tu app desde el navegador. Tarda ~20 minutos
y no cuesta plata (planes gratuitos de MongoDB Atlas y Render).

> **Importante**: esto requiere crear 2 cuentas gratis (con tu email). Es un paso
> que solo vos podés hacer — no hay forma de crearlas por vos.

## Paso 1: subir el código actualizado a GitHub

En la carpeta `F:\nutrix\nutrix`:

```powershell
git add .
git commit -m "Seguridad: helmet, rate-limit, CORS, JWT fuerte + deploy listo"
git push
```

Verificá que el repo en GitHub tenga los archivos nuevos (`render.yaml`,
`server/server.js` actualizado). El `.env` sigue sin subirse (está en `.gitignore`). ✓

## Paso 2: crear la base de datos gratis (MongoDB Atlas)

1. Entrá a https://www.mongodb.com/cloud/atlas y creá cuenta gratis
2. Creá un **cluster** gratuito (plan M0, free)
3. **Database Access**: creá un usuario con contraseña
4. **Network Access**: "Add IP Address" → `0.0.0.0/0` (permite todo; Render lo necesita)
5. **Connect → Drivers** → copiá el connection string (`mongodb+srv://...`)

## Paso 3: desplegar el backend + la web (Render)

1. Entrá a https://render.com y creá cuenta (podés con GitHub)
2. **New → Blueprint** → conectá tu cuenta de GitHub
3. Elegí el repo `nutrix`. Render va a detectar el archivo `render.yaml`
4. Cuando pida `MONGO_URI`, pegá el connection string del paso 2
5. **Apply** → esperá a que termine de compilar (3-5 min)

Cuando esté listo te da una URL tipo `https://nutrix.onrender.com`. **Esa es tu demo.**

> Nota: el plan gratis de Render "duerme" el servicio tras 30 min sin uso.
> La primera visita después de estar dormido tarda ~1 min en cargar.

## Paso 4: verificá que todo funciona

- Abrí `https://tu-app.onrender.com` → deberías ver la app
- Creá una cuenta de prueba y completá el test de salud
- Generá el plan (va a funcionar aunque no tengas clave de IA, usa el motor de reglas)

## Paso 5 (opcional): activar la IA del plan

1. Creá clave en https://console.anthropic.com (cuesta plata por uso; podés dejar la
   app sin IA y sigue funcionando)
2. En Render: **Environment** → agregá `ANTHROPIC_API_KEY`

## Paso 6 (opcional): login con Google

Requiere crear un proyecto en https://console.cloud.google.com:
1. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
2. Tipo: *Web application*; origen: `https://tu-app.onrender.com`
3. Copiá el `GOOGLE_CLIENT_ID` en Render (Environment)
4. En `client/.env.production` agregá `VITE_GOOGLE_CLIENT_ID=...` y reconstruí

> Para no romper tu dev local: el valor de `VITE_GOOGLE_CLIENT_ID` se lee al
> compilar. Si no lo ponés, el botón de Google simplemente no aparece.

## Costos y seguridad

- **Costo**: $0 (planes free). Solo la IA de Anthropic cobra por uso real.
- **Seguridad activada en el deploy**:
  - `JWT_SECRET` se genera automáticamente como secreto de Render (nunca se imprime)
  - `MONGO_URI` y API keys se guardan como variables de entorno (no en el código)
  - El servidor tiene: helmet (headers de seguridad), límite de intentos en login
    (anti fuerza bruta), límite de generaciones de IA (protege tu crédito), CORS
    restringido y validación de que `JWT_SECRET` sea fuerte
