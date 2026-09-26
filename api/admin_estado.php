<?php
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/csrf.php';
require_once __DIR__ . '/../includes/api_helpers.php';

requerirAdmin('login.html');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responderJson(['ok' => false, 'error' => 'Método no permitido'], 405);
}

$in = leerEntrada();

if (!csrfValido($in['csrf'] ?? null)) {
    responderJson(['ok' => false, 'error' => 'Token inválido.'], 419);
}

$id = (int)($in['id'] ?? 0);
$estado = $in['estado'] ?? '';

if (!in_array($estado, ['pendiente', 'contactado', 'cerrado'], true)) {
    responderJson(['ok' => false, 'error' => 'Estado inválido.'], 422);
}

$stmt = db()->prepare('UPDATE service_requests SET estado = ? WHERE id = ?');
$stmt->execute([$estado, $id]);

responderJson(['ok' => true]);
