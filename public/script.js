// script.js
// Comportamiento del frontend: menú móvil, animaciones al hacer scroll
// y envío del formulario de contacto al backend.

document.addEventListener('DOMContentLoaded', () => {
  // ----- Año actual en el footer -----
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // ----- Menú móvil -----
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Cierra el menú al hacer clic en un enlace (útil en móvil)
    navMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ----- Animación sutil de aparición al hacer scroll -----
  const revealSelectors = [
    '.hero__text', '.hero__logo',
    '.service-card', '.about__text', '.stat-card',
    '.contact__intro', '.contact-form',
  ];
  const revealEls = document.querySelectorAll(revealSelectors.join(','));
  revealEls.forEach((el) => el.classList.add('reveal'));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    // Si el navegador no soporta IntersectionObserver, se muestra todo directo
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ----- Formulario de contacto -----
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      const payload = {
        name: formData.get('name')?.toString().trim(),
        email: formData.get('email')?.toString().trim(),
        message: formData.get('message')?.toString().trim(),
        website: formData.get('website')?.toString().trim(), // honeypot
      };

      // Validación básica en el navegador (la validación real ocurre en el servidor)
      if (!payload.name || !payload.email || !payload.message) {
        mostrarEstado('Por favor completa todos los campos.', 'error');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando...';
      mostrarEstado('', '');

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          mostrarEstado('¡Gracias! Tu mensaje fue enviado. Te responderemos pronto.', 'success');
          form.reset();
        } else {
          mostrarEstado(data.error || 'Ocurrió un error al enviar tu mensaje.', 'error');
        }
      } catch (error) {
        mostrarEstado('No se pudo conectar con el servidor. Intenta de nuevo.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar mensaje';
      }
    });
  }

  function mostrarEstado(texto, tipo) {
    statusEl.textContent = texto;
    statusEl.className = 'form-status' + (tipo ? ` ${tipo}` : '');
  }
});
