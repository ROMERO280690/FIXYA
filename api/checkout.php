<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/csrf.php';
require_once __DIR__ . '/../includes/mailer.php';
require_once __DIR__ . '/../includes/api_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$in = leerEntrada();

if (!csrfValido($in['csrf'] ?? null)) {
    responderJson(['ok' => false, 'error' => 'Token inválido. Recargá la página e intentá de nuevo.'], 419);
}

if (!empty($in['sitio_web'] ?? '')) {
    responderJson(['ok' => true]);
}

$nombre = limpiar($in['nombre'] ?? '');
$apellido = limpiar($in['apellido'] ?? '');
$email = filter_var(trim($in['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$telefono = limpiar($in['telefono'] ?? '');
$servicio = limpiar($in['servicio'] ?? '');
$descripcion = limpiar($in['descripcion'] ?? '');

$errores = [];
if ($nombre === '') $errores[] = 'El nombre es obligatorio.';
if ($apellido === '') $errores[] = 'El apellido es obligatorio.';
if (!$email) $errores[] = 'El email no es válido.';
if ($telefono === '') $errores[] = 'El teléfono es obligatorio.';
if ($servicio === '') $errores[] = 'Elegí un servicio.';

if ($errores) {
    responderJson(['ok' => false, 'error' => implode(' ', $errores)], 422);
}

$stmt = db()->prepare('INSERT INTO service_requests (nombre, apellido, email, telefono, servicio, descripcion, ip) VALUES (?, ?, ?, ?, ?, ?, ?)');
$stmt->execute([$nombre, $apellido, $email, $telefono, $servicio, $descripcion, $_SERVER['REMOTE_ADDR'] ?? null]);

enviarEmail(
    'Nueva solicitud de servicio — FIXYA',
    "Nombre: {$nombre} {$apellido}\nEmail: {$email}\nTeléfono: {$telefono}\nServicio: {$servicio}\n\nDescripción:\n{$descripcion}",
    $email
);

responderJson(['ok' => true, 'mensaje' => 'Contratación confirmada. Te contactaremos para coordinar el servicio.']);
