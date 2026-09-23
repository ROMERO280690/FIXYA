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

$email = filter_var(trim($in['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$password = (string)($in['contrasena'] ?? '');

if (!$email || $password === '') {
    responderJson(['ok' => false, 'error' => 'Ingresá tu email y contraseña.'], 422);
}

// Límite simple de intentos por sesión para dificultar fuerza bruta.
iniciarSesionSegura();
$_SESSION['login_attempts'] = ($_SESSION['login_attempts'] ?? 0) + 1;
if ($_SESSION['login_attempts'] > 20) {
    responderJson(['ok' => false, 'error' => 'Demasiados intentos. Probá de nuevo más tarde.'], 429);
}

$stmt = db()->prepare('SELECT id, password_hash FROM users WHERE email = ?');
$stmt->execute([$email]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
    responderJson(['ok' => false, 'error' => 'Email o contraseña incorrectos.'], 401);
}

session_regenerate_id(true);
$_SESSION['user_id'] = (int)$usuario['id'];
unset($_SESSION['login_attempts']);

responderJson(['ok' => true, 'redirect' => 'perfil.php']);
