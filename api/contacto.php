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

// Honeypot: campo oculto que un humano nunca completa.
if (!empty($in['sitio_web'] ?? '')) {
    responderJson(['ok' => true]); // se responde OK para no delatar el filtro a bots
}

$nombre = limpiar($in['nombre'] ?? '');
$email = filter_var(trim($in['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$telefono = limpiar($in['telefono'] ?? '');
$interes = limpiar($in['categoria'] ?? '');
$mensaje = limpiar($in['mensaje'] ?? '');

$errores = [];
if ($nombre === '') $errores[] = 'El nombre es obligatorio.';
if (!$email) $errores[] = 'El email no es válido.';
if ($mensaje === '') $errores[] = 'El mensaje es obligatorio.';

if ($errores) {
    responderJson(['ok' => false, 'error' => implode(' ', $errores)], 422);
}

$stmt = db()->prepare('INSERT INTO contact_messages (nombre, email, telefono, interes, mensaje, ip) VALUES (?, ?, ?, ?, ?, ?)');
$stmt->execute([$nombre, $email, $telefono, $interes, $mensaje, $_SERVER['REMOTE_ADDR'] ?? null]);

enviarEmail(
    'Nueva consulta de contacto — FIXYA',
    "Nombre: {$nombre}\nEmail: {$email}\nTeléfono: {$telefono}\nInterés: {$interes}\n\nMensaje:\n{$mensaje}",
    $email
);

responderJson(['ok' => true, 'mensaje' => 'Consulta enviada. FIXYA te contactará a la brevedad.']);
