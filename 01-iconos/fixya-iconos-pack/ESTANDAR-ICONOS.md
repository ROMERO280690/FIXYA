# Estándar visual de iconos FIXYA

Usar este mismo lenguaje en **todas** las páginas y secciones (home, categoría, perfil, checkout, app).

## Colores
- Navy: `#0B1F3A`
- Naranja: `#FF8A00` (acento `#F5A623` permitido en UI)
- Fondo del asset: blanco puro
- Sin degradés ni sombras en el trazo

## Estilo
- Monoline (trazo uniforme medio-grueso)
- Terminales y esquinas redondeadas
- Split bicolor navy + naranja en cada icono
- Sin texto tipográfico dentro del icono (salvo marca genérica MP en pago)
- Cuadrado 1:1, sujeto centrado con padding

## Naming
- Categorías: `cat-<slug>.png` (ej. `cat-medicos.png`)
- UI / flujo: `ui-<slug>.png` (ej. `ui-chat.png`, `ui-mercado-pago.png`)
- Features ilustradas (pack anterior): `feat-<slug>.png`

## Uso en producto
- Misma familia en: cómo funciona, trust chips, categorías, empty states, nav
- Tamaño recomendado en grilla: 64–96px display; 24–32px inline UI
- No mezclar este set con iconos de otra tipografía o relleno sólido distinto

## Contenido de este pack
- `03-categorias-base/` — 12 categorías originales
- `03-categorias-extra/` — categorías nuevas (salud, hogar, oficios, etc.)
- `08-iconos-ui/` — chat, pagos, contratá, agenda, etc.

## Marcas de terceros (importante)
- **Mercado Pago:** usar SOLO assets oficiales de `03-site-render/fixya-site-render-producto-completo/assets/marcas/mercado-pago/` (descargados del brand kit oficial 2025).
- No reinventar el logo MP en navy/naranja FIXYA. Colores y tipografía propios de Mercado Pago.
- Archivo `ui-mercado-pago-CUSTOM-NO-USAR.png` = intento incorrecto; no usar en producción.
- Fuente: https://www.mercadopago.com.ar/mp/logo-oficial
