# FIXYA — material organizado

Carpeta única del proyecto. Cada archivo existe **una sola vez**: se eliminaron los duplicados
de los paquetes descargados y las páginas que los usaban se reapuntaron a la copia canónica.

## Estructura

```text
FIXYA-organizado/
├── 00-referencia/            Referencia visual principal (image.png)
├── 01-iconos/                Iconografía oficial: categorías base/extra, íconos UI, ESTANDAR-ICONOS.md
├── 02-marketing/             Ads (Meta, Google, stories), emails de bienvenida/reseña, kit profesionales
├── 03-site-render/           Prototipos HTML anteriores (homepage, UI kit, checkout con Mercado Pago, emails)
│                             └─ assets/marcas/mercado-pago/: logos oficiales de Mercado Pago
├── 04-web-assets/            Pack de marca: logos, hero/marketing, categorías, features, extras, corporativas
├── 05-web-completa/          ★ SITIO ACTUAL (FIXYA.io): 12 páginas, assets optimizados en WebP
├── 06-fixya-fun/             Landing de la academia FIXYA.fun
└── 99-versiones-anteriores/  Versiones viejas de algunas páginas, solo como archivo
```

## Dónde está cada cosa

| Necesito… | Ir a |
|---|---|
| Trabajar en el sitio web | `05-web-completa/` (abrir `index.html`) |
| Un ícono de categoría o UI | `01-iconos/fixya-iconos-pack/` |
| Logos, fotos corporativas, hero | `04-web-assets/fixya-pack-final/` |
| Logo oficial de Mercado Pago | `03-site-render/fixya-site-render-producto-completo/assets/marcas/mercado-pago/` |
| Piezas de campaña | `02-marketing/fixya-marketing-pack/` |
| Reglas de uso de íconos y marca | `01-iconos/fixya-iconos-pack/ESTANDAR-ICONOS.md`, `04-web-assets/fixya-pack-final/AUDITORIA.md` |

## Notas

- Los prototipos de `02` y `03` ya no tienen su propia copia de `assets/`: sus imágenes apuntan
  (con rutas relativas) a `01-iconos` y `04-web-assets`. Si movés esas carpetas, mantené la estructura.
- `05-web-completa/assets/` es independiente: contiene versiones optimizadas (WebP, íconos 192px,
  logo transparente) y se puede publicar sola.
- Los íconos originales de `01`/`04` están en alta resolución (1280×720 JPEG con extensión .png);
  usar las versiones de `05-web-completa/assets/` para web.
