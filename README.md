# FIXYA — sitio web

Repositorio del sitio de producción de **fixya.io**. El contenido de este
repositorio se despliega tal cual a la raíz del hosting (`public_html`), por
eso el sitio vive directamente en la raíz del repo y no en una subcarpeta.

## Estructura

```text
.
├── index.html, servicios.html, categoria.html, ...   Páginas del sitio
├── producto.php, perfil.php, dashboard.php           Páginas dinámicas (PHP)
├── api/                                              Endpoints del backend (contacto, checkout, login, registro)
├── includes/                                         Helpers PHP (DB, auth, CSRF, catálogo de categorías)
├── db/schema.sql                                      Esquema de la base de datos
├── assets/                                            Imágenes, logos e íconos optimizados para web
├── config.example.php                                 Plantilla de configuración (copiar como config.php, NO se sube al hosting con datos reales)
├── DEPLOY-HOSTINGER.md                                 Guía de despliegue paso a paso
├── _reemplazados-por-php/                              Versiones estáticas viejas (perfil/dashboard/producto), solo de archivo
└── _recursos-marca/                                    Material de marca que no forma parte del sitio: íconos fuente,
                                                         piezas de marketing, prototipos históricos (00 a 04, 06, 99)
```

## Desarrollo local

El sitio usa PHP + MySQL. Con PHP instalado localmente:

```bash
php -S localhost:4174
```

Necesitás una base `fixya` local (importar `db/schema.sql`) y un `config.php`
copiado de `config.example.php` (el bloque `if ($esLocal)` ya apunta a
`root` sin contraseña, el estándar de XAMPP).

## Desplegar en Hostinger

Ver [`DEPLOY-HOSTINGER.md`](DEPLOY-HOSTINGER.md).

**Importante si usás el despliegue automático por Git de hPanel:** cada
redeploy clona el repositorio de nuevo, así que `config.php` (que no está en
el repo a propósito, para no exponer credenciales) se pierde y hay que
volver a subirlo por FTP después de cada redeploy.

## Material de marca

Todo lo que no es el sitio en sí (íconos originales, piezas de marketing,
prototipos anteriores) vive en [`_recursos-marca/`](_recursos-marca/) y se
despliega junto con el sitio pero no está enlazado desde ninguna página.
