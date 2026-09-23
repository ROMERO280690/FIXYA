<?php
/**
 * Configuración de FIXYA — editar SOLO estos valores antes de subir a Hostinger.
 * En hPanel: Bases de datos > MySQL, creá una base y un usuario, y pegá esos datos acá.
 * Localmente (XAMPP) ya está configurado para funcionar sin cambios.
 */

// Detecta si corre en el servidor local de pruebas (XAMPP / php -S) o en Hostinger.
$esLocal = in_array($_SERVER['SERVER_NAME'] ?? '', ['localhost', '127.0.0.1', ''], true);

if ($esLocal) {
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'fixya');
    define('DB_USER', 'root');
    define('DB_PASS', '');
} else {
    // === Reemplazar con los datos reales de Hostinger (hPanel > Bases de datos) ===
    define('DB_HOST', 'localhost');
    define('DB_NAME', 'u000000000_fixya');
    define('DB_USER', 'u000000000_fixya');
    define('DB_PASS', 'CAMBIAR_ESTA_CONTRASENA');
}

// Email donde llegan las consultas del formulario de contacto y presupuestos.
define('MAIL_TO', 'info@fixya.emprenor.com.ar');
define('MAIL_FROM', 'no-responder@fixya.io');

// Cambiar por una cadena aleatoria propia antes de producción (usada para firmar la sesión).
define('APP_SECRET', 'fixya-cambiar-este-valor-en-produccion');
