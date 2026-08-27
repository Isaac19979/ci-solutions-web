# C&I Solutions — Sitio Web

Sitio web corporativo de C&I Solutions (desarrollo web, desarrollo de apps y
consultoría empresarial), con formulario de contacto que envía correos reales
usando [Resend](https://resend.com).

## Estructura del proyecto

```
ci-solutions-web/
├── package.json        Dependencias y script de arranque
├── server.js            Servidor Express (sirve la página y envía correos)
├── .env.example          Plantilla de variables de entorno
├── public/
│   ├── index.html        Contenido de la página
│   ├── style.css         Estilos
│   ├── script.js         Interactividad (menú, formulario)
│   └── assets/logo.png   Logo de la empresa
└── README.md
```

## 1. Correr el proyecto en tu computadora

Necesitas tener [Node.js](https://nodejs.org) instalado (versión 18 o superior).

```bash
# 1. Instala las dependencias
npm install

# 2. Crea tu archivo de variables de entorno a partir del ejemplo
cp .env.example .env
```

Abre el archivo `.env` que se creó y complétalo con tus datos reales (ver
paso 2 para conseguir la API key de Resend).

```bash
# 3. Inicia el servidor
npm start
```

Abre tu navegador en **http://localhost:3000** — deberías ver la página.

## 2. Configurar Resend (envío de correos)

1. Crea una cuenta gratuita en [resend.com](https://resend.com).
2. En el panel, ve a **API Keys** y crea una nueva key.
3. Copia esa key y pégala en tu archivo `.env` en la variable `RESEND_API_KEY`.
4. El proyecto ya está configurado para enviar desde `onboarding@resend.dev`
   (una dirección de pruebas que Resend ofrece gratis, sin necesidad de
   verificar un dominio propio). Cuando tengan un dominio propio, pueden
   verificarlo en Resend y cambiar la dirección `from` en `server.js`.
5. Prueba el formulario de contacto localmente: si todo está bien
   configurado, debería llegarte un correo a la dirección que pusiste en
   `CONTACT_EMAIL`.

## 3. Subir el proyecto a GitHub

```bash
git init
git add .

```

Crea un repositorio nuevo en GitHub (puede ser privado) y luego:

```bash
git remote add origin https://github.com/TU-USUARIO/ci-solutions-web.git
git branch -M main
git push -u origin main
```

**Importante:** el archivo `.env` con tus claves reales nunca se sube a
GitHub porque está en `.gitignore`. Solo `.env.example` (sin datos reales)
se sube.

## 4. Desplegar en Render

1. Crea una cuenta gratuita en [render.com](https://render.com) y conéctala
   con tu cuenta de GitHub.
2. Haz clic en **New +** → **Web Service**.
3. Selecciona el repositorio `ci-solutions-web`.
4. Configura:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. En la sección **Environment Variables**, agrega:
   - `RESEND_API_KEY` con tu API key real
   - `CONTACT_EMAIL` con el correo donde quieren recibir los mensajes
6. Haz clic en **Create Web Service**. Render instalará todo y desplegará
   tu sitio automáticamente, dándote una URL pública (algo como
   `https://ci-solutions-web.onrender.com`).

Cada vez que hagas `git push` a la rama `main`, Render volverá a desplegar
la página automáticamente con los cambios.

### Nota sobre el plan gratuito de Render

En el plan gratuito, el servicio "se duerme" tras un rato sin visitas y
tarda unos segundos en despertar en la siguiente visita. Es normal y no
afecta el funcionamiento del sitio, solo la primera carga después de
inactividad.
