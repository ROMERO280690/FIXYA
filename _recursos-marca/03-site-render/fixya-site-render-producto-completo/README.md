# FIXYA — Product design block (static HTML/CSS)

Prototipo estático de **FIXYA**: homepage + UI kit + pantallas internas + emails transaccionales.

## Cómo abrir

Abrí cualquier HTML en el navegador (sin build):

```bash
cd /workspace/fixya-site-render
# opcional: servidor local
python3 -m http.server 8080
# luego http://localhost:8080/
```

Punto de entrada recomendado: [`producto.html`](producto.html) (mapa de pantallas) o [`index.html`](index.html).

## Mapa de archivos

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Homepage |
| `ui-kit.html` | Living style guide |
| `categoria.html` | Listado categoría (Plomería) |
| `perfil.html` | Perfil de técnico |
| `checkout.html` | Pedido + pago Mercado Pago / escrow |
| `login.html` | Acceso cliente / profesional |
| `producto.html` | Índice / file map |
| `styles.css` | Estilos compartidos (brand + producto) |
| `emails/presupuesto-recibido.html` | Email: recibiste N presupuestos |
| `emails/pago-retenido.html` | Email: pago MP retenido |
| `emails/trabajo-liberado.html` | Email: fondos liberados + reseña |

## Marca

- Navy `#0B1F3A` · Orange `#FF8A00` / `#F5A623` · Gray `#F4F6F9` · Text `#1A2332`
- Fuentes: Inter + Plus Jakarta Sans
- Logos: `assets/logos/logo-horizontal.png` (claro), `assets/logos/logo-blanco.png` (oscuro)
- Pago: `assets/iconos-ui/ui-mercado-pago.png` (ISO handshake FIXYA)
- Español Argentina (vos)

## Assets

Copiados en `assets/` (categorías, corporativas, features, iconos-ui, logos, marketing, extras, marcas).
