<?php
require_once __DIR__ . '/db.php';

function iniciarSesionSegura(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => 0,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_start();
    }
}

function usuarioActual(): ?array
{
    iniciarSesionSegura();
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    static $cache = null;
    if ($cache === null) {
        $stmt = db()->prepare('SELECT id, nombre, apellido, email, tipo_usuario, especialidad, zona, precio_base, bio, foto, es_admin FROM users WHERE id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $cache = $stmt->fetch() ?: null;
    }
    return $cache;
}

function requerirSesion(string $redirectA = 'login.html'): array
{
    $usuario = usuarioActual();
    if (!$usuario) {
        header('Location: ' . $redirectA);
        exit;
    }
    return $usuario;
}

function requerirAdmin(string $redirectA = 'login.html'): array
{
    $usuario = requerirSesion($redirectA);
    if (empty($usuario['es_admin'])) {
        http_response_code(403);
        exit('No autorizado.');
    }
    return $usuario;
}
