<?php
/**
 * Plantilla de configuración de FIXYA.
 * Copiar este archivo como config.php y completar con los datos reales
 * (nunca subir config.php con credenciales reales a un repositorio público).
 */

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

define('MAIL_TO', 'info@fixya.io');
define('MAIL_FROM', 'no-responder@fixya.io');
define('APP_SECRET', 'fixya-cambiar-este-valor-en-produccion');
