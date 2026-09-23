<?php

function leerEntrada(): array
{
    $raw = file_get_contents('php://input');
    if ($raw !== false && $raw !== '' && str_starts_with(trim($raw), '{')) {
        $data = json_decode($raw, true);
        if (is_array($data)) {
            return $data;
        }
    }
    return $_POST;
}

function responderJson(array $payload, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload);
    exit;
}

function limpiar(?string $valor): string
{
    return trim(htmlspecialchars($valor ?? '', ENT_QUOTES, 'UTF-8'));
}
