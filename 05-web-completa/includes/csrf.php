<?php
require_once __DIR__ . '/auth.php';

function csrfToken(): string
{
    iniciarSesionSegura();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrfValido(?string $token): bool
{
    iniciarSesionSegura();
    return !empty($_SESSION['csrf']) && !empty($token) && hash_equals($_SESSION['csrf'], $token);
}
