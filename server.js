// server.js
// Servidor principal de la pagina web de C&I Solutions.
// Sirve los archivos estaticos (HTML/CSS/JS) y expone un endpoint
// para recibir y enviar por correo los mensajes del formulario de contacto.

require('dotenv').config();
const express = require('express');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// Direccion donde queremos recibir los mensajes de contacto.
// Se puede cambiar sin tocar el codigo, solo editando la variable de entorno.
const CONTACT_EMAIL = process.env.CONTACT_EMAIL || 'cyisolutionscr@gmail.com';

// Cliente de Resend para enviar correos. Si no hay API key configurada,
// el servidor sigue funcionando (la pagina carga), pero el envio de
// correos fallara con un mensaje claro en la consola y en el formulario.
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Middlewares:
// - express.json() permite leer el cuerpo (body) de las peticiones en formato JSON
// - express.static() sirve todos los archivos dentro de la carpeta "public" (html, css, js, imagenes)
app.use(express.json());
app.use(express.static('public'));

// Pequena validacion de correo electronico (no perfecta, pero suficiente para un formulario de contacto)
function esCorreoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

// Endpoint que recibe el formulario de contacto.
// Espera un JSON con: { name, email, message, website }
// "website" es un campo "honeypot": es invisible para personas reales,
// pero los bots que llenan formularios automaticamente suelen completarlo.
// Si viene lleno, asumimos que es spam y respondemos como si todo hubiera ido bien
// (sin enviar el correo), para no darle pistas al bot.
app.post('/api/contact', async (req, res) => {
  const { name, email, message, website } = req.body || {};

  if (website) {
    return res.json({ success: true });
  }

  // Validacion basica de los campos obligatorios
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: 'Por favor completa nombre, correo y mensaje.',
    });
  }

  if (!esCorreoValido(email)) {
    return res.status(400).json({
      success: false,
      error: 'El correo electronico no parece valido.',
    });
  }

  if (message.length > 3000) {
    return res.status(400).json({
      success: false,
      error: 'El mensaje es demasiado largo (maximo 3000 caracteres).',
    });
  }

  // Si no hay API key configurada, no podemos enviar el correo.
  if (!resend) {
    console.error('RESEND_API_KEY no esta configurada. Revisa tu archivo .env');
    return res.status(500).json({
      success: false,
      error: 'El servidor no esta configurado para enviar correos todavia.',
    });
  }

  try {
    await resend.emails.send({
      // "onboarding@resend.dev" es la direccion de pruebas que Resend ofrece
      // gratis sin necesidad de verificar un dominio propio.
      // Cuando tengan un dominio propio verificado en Resend, se puede
      // cambiar por algo como "contacto@cisolutions.com".
      from: 'C&I Solutions <onboarding@resend.dev>',
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `Nuevo mensaje de contacto de ${name}`,
      text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`,
      html: `
        <h2>Nuevo mensaje desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${escaparHtml(name)}</p>
        <p><strong>Correo:</strong> ${escaparHtml(email)}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escaparHtml(message).replace(/\n/g, '<br>')}</p>
      `,
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error enviando el correo con Resend:', error);
    return res.status(500).json({
      success: false,
      error: 'No se pudo enviar el mensaje. Intenta de nuevo mas tarde.',
    });
  }
});

// Evita que texto escrito por el usuario rompa el HTML del correo (seguridad basica)
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

app.listen(PORT, () => {
  console.log(`C&I Solutions corriendo en http://localhost:${PORT}`);
});
