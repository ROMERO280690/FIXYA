const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const yearEl = document.getElementById('year');
const searchForm = document.querySelector('.search-panel');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (searchForm) {
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const servicio = document.getElementById('servicio')?.value?.trim();
    const zona = document.getElementById('zona')?.value?.trim();

    if (document.getElementById('servicios')) {
      document.getElementById('servicios').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (servicio || zona) {
      window.alert(`Búsqueda activa: ${servicio || 'servicio'} en ${zona || 'tu zona'}.`);
    }
  });
}

const navLinks = document.querySelectorAll('.main-nav a, .header-actions a');
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    if (header) {
      header.classList.remove('is-open');
    }
    if (navToggle) {
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });
});

/**
 * Envío real de formularios contra el backend PHP (api/*.php).
 * Cada formulario mapeado abajo se postea como JSON, incluyendo un token CSRF
 * fresco pedido a api/csrf.php, y muestra el resultado en su .form-message.
 */
async function obtenerCsrfToken() {
  const respuesta = await fetch('api/csrf.php', { credentials: 'same-origin' });
  const datos = await respuesta.json();
  return datos.token;
}

function mostrarMensaje(form, texto, tipo) {
  const el = form.querySelector('.form-message');
  if (!el) {
    window.alert(texto);
    return;
  }
  el.textContent = texto;
  el.style.display = 'block';
  el.style.color = tipo === 'error' ? '#b3261e' : '#156f43';
}

function conectarFormulario(selector, endpoint, { onExito } = {}) {
  const form = document.querySelector(selector);
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const boton = form.querySelector('button[type="submit"]');
    const textoOriginal = boton ? boton.textContent : '';
    if (boton) {
      boton.disabled = true;
      boton.textContent = 'Enviando…';
    }

    try {
      const datos = Object.fromEntries(new FormData(form).entries());
      datos.csrf = await obtenerCsrfToken();

      const respuesta = await fetch(endpoint, {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos),
      });
      const resultado = await respuesta.json();

      if (respuesta.ok && resultado.ok) {
        mostrarMensaje(form, resultado.mensaje || 'Listo.', 'ok');
        if (resultado.redirect) {
          window.location.href = resultado.redirect;
          return;
        }
        form.reset();
        if (onExito) onExito(resultado);
      } else {
        mostrarMensaje(form, resultado.error || 'No se pudo completar la operación.', 'error');
      }
    } catch (error) {
      mostrarMensaje(form, 'Error de conexión. Probá de nuevo en un momento.', 'error');
    } finally {
      if (boton) {
        boton.disabled = false;
        boton.textContent = textoOriginal;
      }
    }
  });
}

conectarFormulario('.contact-form', 'api/contacto.php');
conectarFormulario('.checkout-form', 'api/checkout.php');
conectarFormulario('.login-form', 'api/login.php');
conectarFormulario('.registro-form', 'api/registro.php');

/**
 * Checkout: preselecciona el servicio según ?servicio=slug (llegando desde
 * producto.php) y mantiene el resumen (nombre del servicio) sincronizado con
 * la opción elegida en el <select>. El precio se cotiza a medida: no hay una
 * tarifa fija por categoría todavía, así que no se muestra un monto inventado.
 */
const nombresServicios = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  gas: 'Gas',
  cerrajeria: 'Cerrajería',
  aire: 'Aire acondicionado',
  pintura: 'Pintura',
  carpinteria: 'Carpintería',
  jardineria: 'Jardinería',
  limpieza: 'Limpieza',
  mudanzas: 'Mudanzas',
  tecnicos: 'Técnicos',
  otros: 'Otros servicios',
};

const selectServicio = document.getElementById('servicio');
if (selectServicio) {
  const resumenServicio = document.getElementById('resumen-servicio');

  const actualizarResumen = () => {
    const nombre = nombresServicios[selectServicio.value];
    if (nombre && resumenServicio) resumenServicio.textContent = nombre;
  };

  const parametros = new URLSearchParams(window.location.search);
  const servicioUrl = parametros.get('servicio');
  if (servicioUrl && nombresServicios[servicioUrl]) {
    selectServicio.value = servicioUrl;
  }

  actualizarResumen();
  selectServicio.addEventListener('change', actualizarResumen);
}
