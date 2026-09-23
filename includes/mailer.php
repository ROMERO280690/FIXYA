<?php
require_once __DIR__ . '/../config.php';

/**
 * Envía un email simple. En Hostinger, mail() funciona sin configuración adicional.
 * Si falla (por ejemplo en un entorno local sin servidor de correo), no interrumpe
 * el flujo: la consulta ya quedó guardada en la base de datos.
 */
function enviarEmail(string $asunto, string $cuerpo, string $replyTo = ''): bool
{
    $headers = [
        'From: FIXYA <' . MAIL_FROM . '>',
        'Content-Type: text/plain; charset=UTF-8',
    ];
    if ($replyTo !== '') {
        $headers[] = 'Reply-To: ' . $replyTo;
    }

    try {
        return @mail(MAIL_TO, $asunto, $cuerpo, implode("\r\n", $headers));
    } catch (\Throwable $e) {
        return false;
    }
}
