# Desplegar FIXYA en Hostinger

El sitio ya está probado localmente (PHP 8.2 + MySQL, flujo completo de registro,
login, perfil, dashboard, contacto y checkout). Estos son los pasos para subirlo
a un hosting de Hostinger (plan Premium/Business con PHP y MySQL).

## 1. Crear la base de datos en hPanel

1. hPanel → **Bases de datos → Bases de datos MySQL**.
2. Creá una base (ej. `u123456789_fixya`) y un usuario con contraseña fuerte.
   Anotá: host (normalmente `localhost`), nombre de base, usuario y contraseña.
3. Abrí **phpMyAdmin** desde hPanel, seleccioná la base y and importá
   [`db/schema.sql`](db/schema.sql) (pestaña *Importar*).

## 2. Configurar `config.php`

Antes de subir, editá el bloque `else` (producción) de [`config.php`](config.php)
con los datos reales del paso 1:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'u123456789_fixya');
define('DB_USER', 'u123456789_fixya');
define('DB_PASS', 'la-contraseña-que-creaste');
```

También cambiá `APP_SECRET` por una cadena aleatoria propia, y confirmá que
`MAIL_TO` sea el email donde querés recibir las consultas.

## 3. Subir los archivos

Por **Administrador de archivos** de hPanel o por FTP, subí **todo el contenido**
de esta carpeta dentro de `public_html` (o la subcarpeta del dominio), **excepto**:

- `.claude/` (config local del asistente, no hace falta en el servidor)
- `_reemplazados-por-php/` (versiones viejas archivadas, no se usan)
- `DEPLOY-HOSTINGER.md` (este archivo, opcional)

## 4. Verificar PHP

hPanel → **Avanzado → Configuración de PHP** → seleccioná PHP 8.1 o superior.

## 5. Activar el dominio y SSL

Si el dominio ya apunta al hosting, hPanel emite el certificado SSL gratis
automáticamente (Let's Encrypt). El `.htaccess` incluido ya fuerza HTTPS y quita
el `www`. Esperá unos minutos a que el certificado esté activo antes de probar
`https://fixya.io`.

## 6. Probar el sitio en producción

- Abrí `https://fixya.io` y navegá el menú completo.
- Probá **Registrarse** con un email real de prueba → debería redirigir a `perfil.php`.
- Cerrá sesión (**Salir**) y volvé a entrar con **Iniciar sesión**.
- Enviá el formulario de **Contacto** y el de **Checkout** → deberían mostrar el
  mensaje de éxito y, si el hosting tiene `mail()` habilitado (Hostinger lo tiene
  por defecto), debería llegarte un email a `info@fixya.emprenor.com.ar`.
- Revisá en phpMyAdmin las tablas `users`, `contact_messages` y `service_requests`
  para confirmar que los datos se están guardando.

## 7. Mantenimiento

- Los mensajes de contacto y solicitudes de servicio quedan en la base de datos
  (tablas `contact_messages` / `service_requests`); podés revisarlos desde phpMyAdmin
  o pedir un panel de administración más adelante.
- `perfil.php` y `dashboard.php` no se indexan en buscadores (están en `robots.txt`
  y llevan `noindex`) porque son áreas privadas de cuenta.
- Si cambiás el dominio o el email de contacto, actualizá `config.php` y
  `sitemap.xml`/`robots.txt` (usan `https://fixya.io` como referencia).
