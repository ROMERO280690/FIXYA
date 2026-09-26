-- FIXYA — esquema de base de datos
-- Importar en hPanel > Bases de datos > phpMyAdmin (o por CLI) antes de subir el sitio.
-- Charset utf8mb4 para soportar tildes y emoji sin problemas.

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  tipo_usuario ENUM('cliente','profesional') NOT NULL DEFAULT 'cliente',
  especialidad VARCHAR(100) DEFAULT NULL,
  zona VARCHAR(100) DEFAULT NULL,
  precio_base VARCHAR(30) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  foto VARCHAR(255) DEFAULT NULL,
  es_admin TINYINT(1) NOT NULL DEFAULT 0,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migracion para bases ya existentes (no falla si la columna ya existe).
ALTER TABLE users ADD COLUMN IF NOT EXISTS foto VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS es_admin TINYINT(1) NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS contact_messages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  telefono VARCHAR(40) DEFAULT NULL,
  interes VARCHAR(120) DEFAULT NULL,
  mensaje TEXT NOT NULL,
  ip VARCHAR(45) DEFAULT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS service_requests (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  apellido VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL,
  telefono VARCHAR(40) NOT NULL,
  servicio VARCHAR(80) NOT NULL,
  descripcion TEXT DEFAULT NULL,
  estado ENUM('pendiente','contactado','cerrado') NOT NULL DEFAULT 'pendiente',
  ip VARCHAR(45) DEFAULT NULL,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
