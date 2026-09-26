<?php

const FOTO_MAX_BYTES = 3 * 1024 * 1024; // 3 MB
const FOTO_MIME_EXT = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

/**
 * Procesa la foto de perfil subida en $_FILES['foto']. Devuelve la ruta
 * relativa a guardar en la base, o null si no se subió ningún archivo.
 * Lanza RuntimeException con un mensaje apto para mostrar al usuario si
 * el archivo no es válido.
 */
function procesarFotoPerfil(int $userId): ?string
{
    if (empty($_FILES['foto']) || $_FILES['foto']['error'] === UPLOAD_ERR_NO_FILE) {
        return null;
    }

    $archivo = $_FILES['foto'];

    if ($archivo['error'] !== UPLOAD_ERR_OK) {
        throw new RuntimeException('No se pudo subir la imagen. Probá de nuevo.');
    }
    if ($archivo['size'] > FOTO_MAX_BYTES) {
        throw new RuntimeException('La imagen no puede superar los 3 MB.');
    }

    $info = @getimagesize($archivo['tmp_name']);
    if ($info === false || !isset(FOTO_MIME_EXT[$info['mime']])) {
        throw new RuntimeException('La imagen debe ser JPG, PNG o WEBP.');
    }

    $ext = FOTO_MIME_EXT[$info['mime']];
    $nombreArchivo = 'u' . $userId . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
    $destino = __DIR__ . '/../uploads/profesionales/' . $nombreArchivo;

    if (!move_uploaded_file($archivo['tmp_name'], $destino)) {
        throw new RuntimeException('No se pudo guardar la imagen en el servidor.');
    }

    return 'uploads/profesionales/' . $nombreArchivo;
}

/**
 * Borra el archivo de foto anterior del disco (si existe) para no acumular
 * archivos huérfanos cuando el usuario sube una foto nueva.
 */
function borrarFotoAnterior(?string $rutaRelativa): void
{
    if (!$rutaRelativa) {
        return;
    }
    $ruta = __DIR__ . '/../' . $rutaRelativa;
    if (is_file($ruta)) {
        @unlink($ruta);
    }
}
