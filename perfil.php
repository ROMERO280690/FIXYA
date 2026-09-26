<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';
require_once __DIR__ . '/includes/uploads.php';

$usuario = requerirSesion('login.html');

$guardadoOk = false;
$errorFoto = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && csrfValido($_POST['csrf'] ?? null)) {
    $especialidad = trim(htmlspecialchars($_POST['especialidad'] ?? '', ENT_QUOTES, 'UTF-8'));
    $zonaInput = trim(htmlspecialchars($_POST['zona'] ?? '', ENT_QUOTES, 'UTF-8'));
    $precioBase = trim(htmlspecialchars($_POST['precio-base'] ?? '', ENT_QUOTES, 'UTF-8'));
    $bio = trim(htmlspecialchars($_POST['bio'] ?? '', ENT_QUOTES, 'UTF-8'));

    $rutaFoto = $usuario['foto'];
    try {
        $nuevaFoto = procesarFotoPerfil((int)$usuario['id']);
        if ($nuevaFoto !== null) {
            borrarFotoAnterior($usuario['foto']);
            $rutaFoto = $nuevaFoto;
        }
    } catch (RuntimeException $e) {
        $errorFoto = $e->getMessage();
    }

    if ($errorFoto === null) {
        $stmt = db()->prepare('UPDATE users SET especialidad = ?, zona = ?, precio_base = ?, bio = ?, foto = ? WHERE id = ?');
        $stmt->execute([$especialidad, $zonaInput, $precioBase, $bio, $rutaFoto, $usuario['id']]);

        $usuario['especialidad'] = $especialidad;
        $usuario['zona'] = $zonaInput;
        $usuario['precio_base'] = $precioBase;
        $usuario['bio'] = $bio;
        $usuario['foto'] = $rutaFoto;
        $guardadoOk = true;
    }
}

function e(?string $v): string { return htmlspecialchars($v ?? '', ENT_QUOTES, 'UTF-8'); }

$nombreCompleto = e($usuario['nombre'] . ' ' . $usuario['apellido']);
$inicial = e(mb_strtoupper(mb_substr($usuario['nombre'], 0, 1)));
$especialidad = e($usuario['especialidad'] ?: 'Sin especialidad definida');
$zona = e($usuario['zona'] ?: 'Zona no definida');
$precioBase = e($usuario['precio_base'] ?: '');
$bio = e($usuario['bio'] ?: '');
$esProfesional = $usuario['tipo_usuario'] === 'profesional';
?>
<!DOCTYPE html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Perfil | FIXYA.io</title>
    <meta name="description" content="Tu perfil en FIXYA.io." />
    <meta name="robots" content="noindex, nofollow" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css" />
    <link rel="icon" type="image/png" sizes="32x32" href="assets/extras/favicon-32.png" />
    <link rel="apple-touch-icon" href="assets/extras/favicon-180.png" />
    <meta name="theme-color" content="#0b1f3a" />
  </head>
  <body>
    <div class="topbar">
      <div class="container topbar-inner">
        <div class="topbar-links">
          <a href="tel:+5493873522920">+54 9 387 352-2920</a>
          <a href="mailto:info@fixya.io">info@fixya.io</a>
        </div>
        <div class="topbar-meta">
          <span>fixya.io</span>
          <span>Tu cuenta</span>
        </div>
      </div>
    </div>

    <header class="site-header">
      <div class="container nav-wrap">
        <a class="brand" href="index.html" aria-label="Inicio FIXYA">
          <img src="assets/logos/logo-horizontal.png" alt="Logo FIXYA" width="400" height="117" />
        </a>

        <button class="nav-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="main-nav">
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav class="main-nav" id="main-nav" aria-label="Navegación principal">
          <a href="perfil.php" class="active">Perfil</a>
          <a href="dashboard.php">Dashboard</a>
          <a href="servicios.html">Servicios</a>
          <?php if (!empty($usuario['es_admin'])): ?><a href="admin.php">Admin</a><?php endif; ?>
        </nav>
        <div class="header-actions">
          <a class="btn btn-outline" href="api/logout.php">Salir</a>
        </div>
      </div>
    </header>

    <main class="page-shell">
      <div class="container profile-grid">
        <section class="profile-card">
          <div class="profile-summary">
            <?php if ($usuario['foto']): ?>
              <img class="profile-pic" src="<?= e($usuario['foto']) ?>" alt="<?= $nombreCompleto ?>" width="92" height="92" />
            <?php else: ?>
              <div class="profile-pic-placeholder" aria-hidden="true"><?= $inicial ?></div>
            <?php endif; ?>
            <div>
              <span class="status-badge">● Cuenta activa</span>
              <h2><?= $nombreCompleto ?></h2>
              <p><?= $especialidad ?> · <?= $zona ?></p>
            </div>
          </div>
          <div class="quick-stats">
            <div class="score-pill">Sin calificaciones aún</div>
            <strong>Cuenta <?= $esProfesional ? 'profesional' : 'de cliente' ?></strong>
          </div>
          <ul class="profile-list" style="margin-top: 18px;">
            <li>Email: <?= e($usuario['email']) ?></li>
            <?php if ($precioBase !== ''): ?><li>Precio base: <?= $precioBase ?></li><?php endif; ?>
            <?php if ($bio !== ''): ?><li><?= $bio ?></li><?php endif; ?>
          </ul>
          <?php if ($esProfesional): ?>
            <p style="margin-top: 16px;"><a href="profesional.php?id=<?= (int)$usuario['id'] ?>" class="btn btn-outline btn-small">Ver mi ficha pública</a></p>
          <?php endif; ?>
        </section>

        <section class="profile-card">
          <span class="eyebrow eyebrow-dark">Editar perfil</span>
          <h2>Actualización</h2>
          <?php if ($guardadoOk): ?>
            <p style="color:#156f43; font-weight:600; margin-bottom: 14px;">Perfil actualizado correctamente.</p>
          <?php endif; ?>
          <?php if ($errorFoto): ?>
            <p style="color:#b3261e; font-weight:600; margin-bottom: 14px;"><?= e($errorFoto) ?></p>
          <?php endif; ?>
          <form method="post" enctype="multipart/form-data">
            <input type="hidden" name="csrf" value="<?= csrfToken() ?>" />
            <div class="form-field">
              <label for="foto">Foto de perfil (JPG, PNG o WEBP, hasta 3 MB)</label>
              <input id="foto" name="foto" type="file" accept="image/png, image/jpeg, image/webp" />
            </div>

            <div class="form-row">
              <div class="form-field">
                <label for="especialidad">Especialidad</label>
                <input id="especialidad" name="especialidad" type="text" value="<?= $especialidad === 'Sin especialidad definida' ? '' : $especialidad ?>" />
              </div>
              <div class="form-field">
                <label for="zona">Zona</label>
                <input id="zona" name="zona" type="text" value="<?= $zona === 'Zona no definida' ? '' : $zona ?>" placeholder="Ej. Salta Capital" />
              </div>
            </div>

            <div class="form-field">
              <label for="precio-base">Precio base</label>
              <input id="precio-base" name="precio-base" type="text" value="<?= $precioBase ?>" />
            </div>

            <div class="form-field">
              <label for="bio">Bio</label>
              <textarea id="bio" name="bio"><?= $bio ?></textarea>
            </div>

            <button class="btn btn-primary" type="submit">Guardar cambios</button>
          </form>
        </section>
      </div>
    </main>

    <footer class="site-footer">
      <div class="container footer-bottom">
        <span>© <span id="year"></span> FIXYA</span>
        <span>Todos los derechos reservados</span>
      </div>
    </footer>

    <script src="script.js"></script>
  </body>
</html>
