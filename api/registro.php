<?php
require_once __DIR__ . '/../includes/db.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/csrf.php';
require_once __DIR__ . '/../includes/api_helpers.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$in = leerEntrada();

if (!csrfValido($in['csrf'] ?? null)) {
    responderJson(['ok' => false, 'error' => 'Token inválido. Recargá la página e intentá de nuevo.'], 419);
}

$nombre = limpiar($in['nombre'] ?? '');
$apellido = limpiar($in['apellido'] ?? '');
$email = filter_var(trim($in['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = (string)($in['contrasena'] ?? '');
$tipoUsuario = ($in['tipo-de-usuario'] ?? 'Cliente') === 'Profesional' ? 'profesional' : 'cliente';

$errores = [];
if ($nombre === '') $errores[] = 'El nombre es obligatorio.';
if ($apellido === '') $errores[] = 'El apellido es obligatorio.';
if (!$email) $errores[] = 'El email no es válido.';
if (strlen($password) < 8) $errores[] = 'La contraseña debe tener al menos 8 caracteres.';

if ($errores) {
    responderJson(['ok' => false, 'error' => implode(' ', $errores)], 422);
}

$existe = db()->prepare('SELECT id FROM users WHERE email = ?');
$existe->execute([$email]);
if ($existe->fetch()) {
    responderJson(['ok' => false, 'error' => 'Ya existe una cuenta con ese email.'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = db()->prepare('INSERT INTO users (nombre, apellido, email, password_hash, tipo_usuario) VALUES (?, ?, ?, ?, ?)');
$stmt->execute([$nombre, $apellido, $email, $hash, $tipoUsuario]);

iniciarSesionSegura();
session_regenerate_id(true);
$_SESSION['user_id'] = (int)db()->lastInsertId();

responderJson(['ok' => true, 'redirect' => 'perfil.php']);
