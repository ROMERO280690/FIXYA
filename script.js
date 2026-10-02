const header = document.querySelector('.site-header');
const navToggle = document.querySelector('.nav-toggle');
const yearEl = document.getElementById('year');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    const isOpen = header.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Close drawer on click outside
document.addEventListener('click', (e) => {
  if (header && header.classList.contains('is-open')) {
    if (!header.contains(e.target) && (!navToggle || !navToggle.contains(e.target))) {
      header.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }
  }
});

// Close drawer on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && header && header.classList.contains('is-open')) {
    header.classList.remove('is-open');
    if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
  }
});

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
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
 * Consulta de estado de sesión para sincronizar la cabecera en todas las páginas.
 */
async function sincronizarSesionEnHeader() {
  try {
    const res = await fetch('/api/me');
    const data = await res.json();
    if (data.ok && data.loggedIn && data.user) {
      const actionsEl = document.querySelector('.header-actions');
      const mainNav = document.getElementById('main-nav');

      if (actionsEl) {
        const isPro = data.user.plan_pro && data.user.plan_pro !== 'gratis';
        const proTag = isPro ? ' ⭐ PRO' : '';
        actionsEl.innerHTML = `
          <a class="btn btn-outline" style="padding:6px 14px; font-size:0.85rem;" href="/dashboard">Mi Panel${proTag} (${data.user.nombre})</a>
          <a class="btn btn-primary" style="padding:6px 14px; font-size:0.85rem;" href="/api/logout">Salir</a>
        `;
      }

      if (mainNav && data.user.es_admin && !document.getElementById('nav-admin-link')) {
        const adminLink = document.createElement('a');
        adminLink.id = 'nav-admin-link';
        adminLink.href = '/admin';
        adminLink.style.color = 'var(--orange)';
        adminLink.style.fontWeight = '700';
        adminLink.textContent = '⚙️ Admin';
        mainNav.appendChild(adminLink);
      }

      // Prellenar nombre y email en formularios de checkout o contacto si está logueado
      const inputNombre = document.getElementById('nombre');
      const inputApellido = document.getElementById('apellido');
      const inputEmail = document.getElementById('email');
      const inputTel = document.getElementById('telefono');

      if (inputNombre && !inputNombre.value) inputNombre.value = data.user.nombre || '';
      if (inputApellido && !inputApellido.value) inputApellido.value = data.user.apellido || '';
      if (inputEmail && !inputEmail.value) inputEmail.value = data.user.email || '';
      if (inputTel && !inputTel.value && data.user.telefono) inputTel.value = data.user.telefono;
    }
  } catch (e) {
    // Silencioso
  }
}

sincronizarSesionEnHeader();

/**
 * CSRF y manejo de formularios
 */
async function obtenerCsrfToken() {
  try {
    const respuesta = await fetch('/api/csrf', { credentials: 'same-origin' });
    const datos = await respuesta.json();
    return datos.token || 'fixya-csrf-valid-token-2025';
  } catch (e) {
    return 'fixya-csrf-valid-token-2025';
  }
}

function mostrarMensaje(form, texto, tipo) {
  let el = form.querySelector('.form-message');
  if (!el) {
    el = document.createElement('div');
    el.className = 'form-message';
    form.prepend(el);
  }
  el.textContent = texto;
  el.style.display = 'block';
  el.style.color = tipo === 'error' ? '#b3261e' : '#156f43';
  el.style.backgroundColor = tipo === 'error' ? '#fdf2f2' : '#f0fdf4';
  el.style.border = tipo === 'error' ? '1px solid #fecaca' : '1px solid #bbf7d0';
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
      boton.textContent = 'Procesando…';
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
        mostrarMensaje(form, resultado.mensaje || 'Operación completada con éxito.', 'ok');
        if (resultado.redirect) {
          window.location.href = resultado.redirect.startsWith('/') ? resultado.redirect : '/' + resultado.redirect;
          return;
        }
        form.reset();
        if (onExito) onExito(resultado);
      } else {
        mostrarMensaje(form, resultado.error || 'No se pudo completar la operación. Verificá los datos.', 'error');
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

conectarFormulario('.contact-form', '/api/contacto');
conectarFormulario('.checkout-form', '/api/checkout', {
  onExito: (resultado) => {
    const modal = document.getElementById('modal-confirmacion');
    const codigoOrdenEl = document.getElementById('codigo-orden');
    if (codigoOrdenEl && resultado && resultado.codigo) {
      codigoOrdenEl.textContent = resultado.codigo;
    }
    if (modal) {
      modal.style.display = 'flex';
    }
  },
});
conectarFormulario('.login-form', '/api/login');
conectarFormulario('.registro-form', '/api/registro');

/**
 * Checkout: nombres de rubros sincronizados
 */
const nombresServicios = {
  plomeria: 'Plomería',
  electricidad: 'Electricidad',
  gas: 'Gas matriculado',
  cerrajeria: 'Cerrajería 24hs',
  aire: 'Aire acondicionado',
  pintura: 'Pintura y acabados',
  herreria: 'Herrería y estructuras',
  carpinteria: 'Carpintería',
  jardineria: 'Jardinería y parques',
  limpieza: 'Limpieza profesional',
  mudanzas: 'Mudanzas y fletes',
  tecnicos: 'Técnicos de electrohogar',
  informatica: 'Informática y redes Wi-Fi',
  albanileria: 'Albañilería y reformas',
  vidrieria: 'Vidriería y mamparas',
  piscinas: 'Piscinas y piletas',
  otros: 'Otros servicios especiales',
};

const selectServicio = document.getElementById('servicio');
if (selectServicio && selectServicio.tagName === 'SELECT') {
  const resumenServicio = document.getElementById('resumen-servicio');

  const actualizarResumen = () => {
    const selectedOptText =
      selectServicio.options && selectServicio.selectedIndex >= 0
        ? selectServicio.options[selectServicio.selectedIndex]?.text
        : '';
    const nombre = nombresServicios[selectServicio.value] || selectedOptText || selectServicio.value;
    if (nombre && resumenServicio) resumenServicio.textContent = nombre;
  };

  const parametros = new URLSearchParams(window.location.search);
  const servicioUrl = parametros.get('servicio');
  if (servicioUrl) {
    const matchedKey = Object.keys(nombresServicios).find(
      (k) => k === servicioUrl.toLowerCase() || nombresServicios[k].toLowerCase().includes(servicioUrl.toLowerCase())
    );
    if (matchedKey) {
      selectServicio.value = matchedKey;
    }
  }

  actualizarResumen();
  selectServicio.addEventListener('change', actualizarResumen);
}

/**
 * Búsqueda instantánea con autocompletado en el input principal de búsqueda
 */
function configurarBusquedaInstantanea() {
  const inputServicio = document.getElementById('servicio');
  if (!inputServicio || inputServicio.tagName === 'SELECT') return;

  // Crear contenedor de sugerencias
  let suggestionsBox = document.getElementById('search-suggestions-box');
  if (!suggestionsBox) {
    suggestionsBox = document.createElement('div');
    suggestionsBox.id = 'search-suggestions-box';
    suggestionsBox.className = 'search-suggestions-box';
    inputServicio.parentElement.style.position = 'relative';
    inputServicio.parentElement.appendChild(suggestionsBox);
  }

  let debounceTimer;
  inputServicio.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = inputServicio.value.trim();
    if (q.length < 2) {
      suggestionsBox.style.display = 'none';
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/buscar?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.ok && (data.categorias.length > 0 || data.profesionales.length > 0)) {
          let html = '';
          if (data.categorias.length > 0) {
            html += '<div class="sug-header">Categorías</div>';
            data.categorias.forEach((c) => {
              html += `
                <a href="${c.url}" class="sug-item">
                  <span class="sug-icon">🔧</span>
                  <div>
                    <strong>${c.nombre}</strong>
                    <small>${c.titulo}</small>
                  </div>
                </a>
              `;
            });
          }
          if (data.profesionales.length > 0) {
            html += '<div class="sug-header">Profesionales</div>';
            data.profesionales.forEach((p) => {
              html += `
                <a href="${p.url}" class="sug-item">
                  <span class="sug-icon">👷</span>
                  <div>
                    <strong>${p.nombre}</strong>
                    <small>${p.especialidad} · ${p.zona}</small>
                  </div>
                </a>
              `;
            });
          }
          suggestionsBox.innerHTML = html;
          suggestionsBox.style.display = 'block';
        } else {
          suggestionsBox.style.display = 'none';
        }
      } catch (e) {
        suggestionsBox.style.display = 'none';
      }
    }, 200);
  });

  document.addEventListener('click', (e) => {
    if (!inputServicio.contains(e.target) && !suggestionsBox.contains(e.target)) {
      suggestionsBox.style.display = 'none';
    }
  });
}

configurarBusquedaInstantanea();

/**
 * Botón flotante de asistencia y urgencias WhatsApp
 */
function inyectarBotonUrgencias() {
  if (document.getElementById('fixya-whatsapp-floating')) return;

  const btn = document.createElement('a');
  btn.id = 'fixya-whatsapp-floating';
  btn.href = 'https://wa.me/5493873522920?text=Hola%20FIXYA%2C%20necesito%20asistencia%20inmediata%20con%20un%20servicio%20t%C3%A9cnico.';
  btn.target = '_blank';
  btn.rel = 'noreferrer';
  btn.setAttribute('aria-label', 'Atención directa por WhatsApp');
  btn.innerHTML = `
    <span class="wa-icon">💬</span>
    <span class="wa-text">Urgencias & WhatsApp</span>
  `;
  document.body.appendChild(btn);
}

inyectarBotonUrgencias();

/**
 * FAQ Real-Time Search & Interactive Cross-Filtering
 */
function inicializarFaqInteractivo() {
  const faqSearchInput = document.getElementById('faq-search-input');
  const faqSearchClear = document.getElementById('faq-search-clear');
  const faqFilterPills = document.querySelectorAll('.faq-filter-pill');
  const faqItems = document.querySelectorAll('.faq-item');
  const faqMetaCount = document.getElementById('faq-meta-count');
  const faqToggleAllBtn = document.getElementById('faq-toggle-all-btn');
  const faqEmptyState = document.getElementById('faq-empty-state');
  const faqEmptyText = document.getElementById('faq-empty-text');
  const faqList = document.getElementById('faq-list');

  if (!faqItems.length) return;

  const NOMBRES_CATEGORIAS = {
    todas: 'Todas las categorías',
    pagos: 'Pagos y Mercado Pago',
    garantia: 'Garantía y Seguridad',
    contratacion: 'Contratación y Plazos',
    profesionales: 'Para Profesionales',
  };

  let currentCategory = 'todas';
  let allExpanded = false;

  // Cache elements and original contents
  const itemCache = Array.from(faqItems).map((item) => {
    const qEl = item.querySelector('.faq-question-text');
    const aEl = item.querySelector('.faq-answer');
    const cat = item.getAttribute('data-faq-cat') || 'todas';
    const catNombre = NOMBRES_CATEGORIAS[cat] || cat;
    return {
      el: item,
      category: cat,
      catNombre,
      keywords: (item.getAttribute('data-keywords') || '').toLowerCase(),
      qEl,
      aEl,
      originalQ: qEl ? qEl.textContent.trim() : '',
      originalA: aEl ? aEl.textContent.trim() : '',
      coincideBusqueda: true,
    };
  });

  function normalizar(texto) {
    return (texto || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
  }

  function resaltarTexto(texto, tokens) {
    if (!tokens || !tokens.length) return texto;
    const normTexto = normalizar(texto);
    const marcadores = [];

    tokens.forEach((t) => {
      if (!t) return;
      let startIdx = 0;
      let matchIdx = normTexto.indexOf(t, startIdx);
      while (matchIdx !== -1) {
        marcadores.push({ start: matchIdx, end: matchIdx + t.length });
        startIdx = matchIdx + 1;
        matchIdx = normTexto.indexOf(t, startIdx);
      }
    });

    if (!marcadores.length) return texto;

    // Merge overlapping ranges
    marcadores.sort((a, b) => a.start - b.start);
    const fusionados = [marcadores[0]];
    for (let i = 1; i < marcadores.length; i++) {
      const actual = marcadores[i];
      const ultimo = fusionados[fusionados.length - 1];
      if (actual.start <= ultimo.end) {
        ultimo.end = Math.max(ultimo.end, actual.end);
      } else {
        fusionados.push(actual);
      }
    }

    let resultado = '';
    let puntero = 0;
    fusionados.forEach((r) => {
      resultado += texto.slice(puntero, r.start);
      resultado += `<mark class="faq-highlight">${texto.slice(r.start, r.end)}</mark>`;
      puntero = r.end;
    });
    resultado += texto.slice(puntero);
    return resultado;
  }

  function cambiarCategoria(nuevaCat) {
    currentCategory = nuevaCat;
    faqFilterPills.forEach((pill) => {
      const cat = pill.getAttribute('data-faq-cat') || 'todas';
      if (cat === currentCategory) {
        pill.classList.add('is-active');
      } else {
        pill.classList.remove('is-active');
      }
    });
    aplicarFiltrosCruzados();
  }

  function aplicarFiltrosCruzados() {
    const rawQuery = faqSearchInput ? faqSearchInput.value.trim() : '';
    const normQuery = normalizar(rawQuery);
    const tokens = normQuery.split(/\s+/).filter(Boolean);

    if (faqSearchClear) {
      faqSearchClear.style.display = rawQuery ? 'flex' : 'none';
    }

    // 1. Calculate matches per category across the dataset for current search tokens
    const conteosPorCategoria = {
      todas: 0,
      pagos: 0,
      garantia: 0,
      contratacion: 0,
      profesionales: 0,
    };

    const totalEnCategoria = {
      todas: itemCache.length,
      pagos: 0,
      garantia: 0,
      contratacion: 0,
      profesionales: 0,
    };

    itemCache.forEach((cache) => {
      totalEnCategoria[cache.category] = (totalEnCategoria[cache.category] || 0) + 1;

      const normQ = normalizar(cache.originalQ);
      const normA = normalizar(cache.originalA);
      const normKw = normalizar(cache.keywords);
      const normCat = normalizar(cache.catNombre);

      const coincideBusqueda =
        tokens.length === 0 ||
        tokens.every(
          (token) =>
            normQ.includes(token) ||
            normA.includes(token) ||
            normKw.includes(token) ||
            normCat.includes(token)
        );

      cache.coincideBusqueda = coincideBusqueda;

      if (coincideBusqueda) {
        conteosPorCategoria.todas++;
        if (conteosPorCategoria[cache.category] !== undefined) {
          conteosPorCategoria[cache.category]++;
        }
      }
    });

    // 2. Update pill badges and no-match visual indicators
    faqFilterPills.forEach((pill) => {
      const cat = pill.getAttribute('data-faq-cat') || 'todas';
      const badge = pill.querySelector('.pill-badge');
      const count = conteosPorCategoria[cat] !== undefined ? conteosPorCategoria[cat] : 0;
      if (badge) {
        badge.textContent = count;
      }
      if (tokens.length > 0 && count === 0) {
        pill.classList.add('has-no-matches');
      } else {
        pill.classList.remove('has-no-matches');
      }
    });

    // 3. Apply Cross-Filter: An item must match BOTH the active category AND search query
    let visibleCount = 0;

    itemCache.forEach((cache) => {
      const { el, category, qEl, aEl, originalQ, originalA, coincideBusqueda } = cache;

      const coincideCategoria = currentCategory === 'todas' || category === currentCategory;
      const esVisible = coincideCategoria && coincideBusqueda;

      if (esVisible) {
        el.style.display = '';
        visibleCount++;

        if (tokens.length > 0) {
          el.open = true;
          if (qEl) qEl.innerHTML = resaltarTexto(originalQ, tokens);
          if (aEl) aEl.innerHTML = resaltarTexto(originalA, tokens);
        } else {
          if (qEl) qEl.textContent = originalQ;
          if (aEl) aEl.textContent = originalA;
        }
      } else {
        el.style.display = 'none';
        if (qEl) qEl.textContent = originalQ;
        if (aEl) aEl.textContent = originalA;
      }
    });

    // 4. Update Meta Bar Counter with accurate cross-filtered totals
    const catLabel = NOMBRES_CATEGORIAS[currentCategory] || 'la categoría';
    const totalEnEstaCat = totalEnCategoria[currentCategory] || itemCache.length;

    if (faqMetaCount) {
      if (tokens.length > 0 && currentCategory !== 'todas') {
        faqMetaCount.innerHTML = `Mostrando <strong>${visibleCount}</strong> de ${totalEnEstaCat} preguntas en <strong>${catLabel}</strong> para "<em>${escapeHtml(rawQuery)}</em>"`;
      } else if (tokens.length > 0) {
        faqMetaCount.innerHTML = `Mostrando <strong>${visibleCount}</strong> de ${itemCache.length} preguntas para "<em>${escapeHtml(rawQuery)}</em>"`;
      } else if (currentCategory !== 'todas') {
        faqMetaCount.innerHTML = `Mostrando <strong>${visibleCount}</strong> preguntas en <strong>${catLabel}</strong>`;
      } else {
        faqMetaCount.innerHTML = `Mostrando <strong>${visibleCount}</strong> preguntas frecuentes`;
      }
    }

    // 5. Intelligent Empty State for Cross-Filtering
    if (faqEmptyState && faqList) {
      if (visibleCount === 0) {
        faqEmptyState.style.display = 'block';
        faqList.style.display = 'none';

        const totalEnOtrasCat = conteosPorCategoria.todas;

        let contenedorAcciones = faqEmptyState.querySelector('.faq-empty-actions');
        if (!contenedorAcciones) {
          const defaultActions = faqEmptyState.querySelector('div[style*="display: flex"]');
          if (defaultActions) {
            defaultActions.className = 'faq-empty-actions';
            contenedorAcciones = defaultActions;
          } else {
            contenedorAcciones = document.createElement('div');
            contenedorAcciones.className = 'faq-empty-actions';
            contenedorAcciones.style.display = 'flex';
            contenedorAcciones.style.justifyContent = 'center';
            contenedorAcciones.style.gap = '10px';
            contenedorAcciones.style.flexWrap = 'wrap';
            contenedorAcciones.style.marginTop = '16px';
            faqEmptyState.appendChild(contenedorAcciones);
          }
        }

        if (tokens.length > 0 && currentCategory !== 'todas' && totalEnOtrasCat > 0) {
          // Matches exist in OTHER categories! Provide cross-category bridge:
          const otrasCategoriasConMatches = Object.keys(conteosPorCategoria)
            .filter((c) => c !== 'todas' && c !== currentCategory && conteosPorCategoria[c] > 0)
            .map((c) => `${NOMBRES_CATEGORIAS[c]} (${conteosPorCategoria[c]})`);

          if (faqEmptyText) {
            faqEmptyText.innerHTML = `
              No encontramos preguntas sobre "<strong>${escapeHtml(rawQuery)}</strong>" dentro de <em>${catLabel}</em>.<br />
              <span style="display:inline-block; margin-top:8px; color: var(--navy); font-weight:600;">
                Sin embargo, hay <strong>${totalEnOtrasCat}</strong> resultado${totalEnOtrasCat === 1 ? '' : 's'} en otras secciones: ${otrasCategoriasConMatches.join(', ')}.
              </span>
            `;
          }

          contenedorAcciones.innerHTML = `
            <button type="button" id="faq-btn-ver-todas" class="btn btn-primary btn-small">
              Ver resultados en Todas las categorías (${totalEnOtrasCat})
            </button>
            <button type="button" id="faq-btn-limpiar-busqueda" class="btn btn-outline btn-small">
              Limpiar búsqueda en esta categoría
            </button>
          `;

          const btnVerTodas = document.getElementById('faq-btn-ver-todas');
          if (btnVerTodas) {
            btnVerTodas.onclick = () => cambiarCategoria('todas');
          }
          const btnLimpiar = document.getElementById('faq-btn-limpiar-busqueda');
          if (btnLimpiar) {
            btnLimpiar.onclick = () => {
              if (faqSearchInput) {
                faqSearchInput.value = '';
                faqSearchInput.focus();
              }
              aplicarFiltrosCruzados();
            };
          }
        } else {
          // No matches anywhere in FAQ or category is empty
          if (faqEmptyText) {
            faqEmptyText.textContent = rawQuery
              ? `No encontramos resultados para "${rawQuery}" en ninguna sección. Probá con términos como "pago", "garantía", "presupuesto" o consultá a soporte.`
              : `No hay preguntas disponibles en la categoría "${catLabel}".`;
          }

          contenedorAcciones.innerHTML = `
            <button type="button" id="faq-reset-all-btn" class="btn btn-primary btn-small">Ver todas las preguntas</button>
            <a href="https://wa.me/5493873522920?text=Hola%20FIXYA%2C%20tengo%20una%20consulta%20que%20no%20encontr%C3%A9%20en%20las%20preguntas%20frecuentes." target="_blank" rel="noreferrer" class="btn btn-outline btn-small">
              Consultar por WhatsApp
            </a>
          `;

          const resetAllBtn = document.getElementById('faq-reset-all-btn');
          if (resetAllBtn) {
            resetAllBtn.onclick = () => {
              if (faqSearchInput) faqSearchInput.value = '';
              cambiarCategoria('todas');
              if (faqSearchInput) faqSearchInput.focus();
            };
          }
        }
      } else {
        faqEmptyState.style.display = 'none';
        faqList.style.display = 'flex';
      }
    }
  }

  // Search input events
  if (faqSearchInput) {
    faqSearchInput.addEventListener('input', aplicarFiltrosCruzados);
    faqSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        faqSearchInput.value = '';
        aplicarFiltrosCruzados();
      }
    });
  }

  // Clear button event
  if (faqSearchClear) {
    faqSearchClear.addEventListener('click', () => {
      if (faqSearchInput) {
        faqSearchInput.value = '';
        faqSearchInput.focus();
      }
      aplicarFiltrosCruzados();
    });
  }

  // Category pill filter events
  faqFilterPills.forEach((pill) => {
    pill.addEventListener('click', () => {
      const cat = pill.getAttribute('data-faq-cat') || 'todas';
      cambiarCategoria(cat);
    });
  });

  // Toggle all items
  if (faqToggleAllBtn) {
    faqToggleAllBtn.addEventListener('click', () => {
      allExpanded = !allExpanded;
      faqItems.forEach((item) => {
        if (item.style.display !== 'none') {
          item.open = allExpanded;
        }
      });
      faqToggleAllBtn.textContent = allExpanded ? 'Colapsar todas' : 'Expandir todas';
    });
  }

  // Initial calculation of pill badges
  aplicarFiltrosCruzados();
}

inicializarFaqInteractivo();
