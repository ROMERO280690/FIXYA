# FIXYA — Marketing & Sales Asset Pack

**Marca:** FIXYA · navy `#0B1F3A` · orange `#FF8A00` · blanco  
**Tono:** español Argentina (vos) · Salta  
**Contacto:** +54 9 387 352-2920 · info@fixya.emprenor.com.ar  
**Pagos:** Mercado Pago (ícono UI en assets / path canónico `fixya-iconos-pack/08-iconos-ui/ui-mercado-pago.png`)

---

## Mapa de archivos

```
fixya-marketing-pack/
├── README.md                          ← este archivo
├── kit-profesionales/
│   ├── index.html                     ← landing “Sumate a FIXYA” (imprimible / PDF vía navegador)
│   └── assets/                        ← logos + íconos UI (MP, expediente, etc.)
├── ads/
│   ├── meta-1x1.html                  ← feed cuadrado “Técnicos verificados cerca tuyo”
│   ├── meta-4x5.html                  ← feed vertical “Pedí presupuesto gratis”
│   ├── story-9x16.html                ← story “Arreglalo fácil con FIXYA”
│   ├── google-display.html            ← banners 728×90 + 300×250
│   ├── assets/ui-mercado-pago.png
│   └── png/                           ← (vacío: GenerateImage no disponible; usar HTML + export)
└── emails/
    ├── bienvenida-cliente.html
    ├── bienvenida-profesional.html
    └── recordatorio-reseña.html
```

ZIP entregable: `/workspace/FIXYA-marketing-pack.zip`

---

## Uso sugerido

### Meta (Facebook / Instagram)
| Archivo | Formato | Uso |
|---------|---------|-----|
| `ads/meta-1x1.html` | 1:1 (1080×1080) | Feed IG/FB — awareness / tráfico |
| `ads/meta-4x5.html` | 4:5 (1080×1350) | Feed vertical — conversión a WhatsApp |
| `ads/story-9x16.html` | 9:16 (1080×1920) | Stories / Reels / Status |

Abrí el HTML, capturá el mock o recreá en Ads Manager / Canva con el copy del bloque “spec”. CTA recomendado: WhatsApp `wa.me/5493873522920`.

### Google Ads (Display)
| Archivo | Tamaños |
|---------|---------|
| `ads/google-display.html` | Leaderboard **728×90** + MPU **300×250** |

Exportá capturas o armá creatividades nativas en Google Ads con el mismo mensaje y CTA “Pedí presupuesto” / “Empezar”.

### WhatsApp / ventas
- Kit profesionales: enviá el link o PDF de `kit-profesionales/index.html` (Imprimir → Guardar PDF).
- Emails: copiá el HTML a tu ESP o usá como plantilla; CTAs apuntan a WhatsApp / mail.

### Emails
| Archivo | Cuándo |
|---------|--------|
| `bienvenida-cliente.html` | Alta de cliente / primer contacto |
| `bienvenida-profesional.html` | Onboarding de técnico / oficio |
| `recordatorio-reseña.html` | Post-trabajo, pedir reseña |

Son table-based con CSS inline-friendly para clientes de correo.

---

## Notas de marca
- No inventar logos: reutilizar los de `kit-profesionales/assets/` (copiados de `fixya-pack-final/01-logos/`).
- Mercado Pago: solo ícono UI del pack (`ui-mercado-pago.png`). La idea de “apretón de manos” queda solo en copy si hace falta, no en imagen inventada.
- Idioma: vos (Argentina).

---

## Cómo generar PDF del kit
1. Abrí `kit-profesionales/index.html` en el navegador.
2. Imprimir → Destino: Guardar como PDF.
3. Márgenes mínimos; fondo de gráficos activado.
