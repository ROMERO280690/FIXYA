<?php
require_once __DIR__ . '/includes/db.php';

function e(?string $v): string { return htmlspecialchars($v ?? '', ENT_QUOTES, 'UTF-8'); }

$id = (int)($_GET['id'] ?? 0);
$stmt = db()->prepare("SELECT id, nombre, apellido, especialidad, zona, precio_base, bio, foto, creado_en FROM users WHERE id = ? AND tipo_usuario = 'profesional'");
$stmt->execute([$id]);
$p = $stmt->fetch();

if (!$p) {
    http_response_code(404);
}

$nombreCompleto = $p ? e($p['nombre'] . ' ' . $p['apellido']) : '';
?>
<!DOCTYPE html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= $p ? $nombreCompleto . ' | FIXYA' : 'Profesional no encontrado | FIXYA' ?></title>
    <?php if (!$p): ?><meta name="robots" content="noindex" /><?php endif; ?>
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
          <span>✓ Mercado Pago</span>
        </div>
      </div>
    </div>

    <header class="site-header">
      <div class="container nav-wrap">
        <a class="brand" href="index.html" aria-label="Inicio FIXYA">
          <img src="assets/logos/logo-horizontal.png" alt="Logo FIXYA" width="400" height="117" />
        </a>
        <button class="nav-toggle" type="button" aria-label="Abrir menú" aria-expanded="false" aria-controls="main-nav">
          <span></span><span></span><span></span>
        </button>
        <nav class="main-nav" id="main-nav" aria-label="Navegación principal">
          <a href="index.html">Inicio</a>
          <a href="servicios.html">Servicios</a>
          <a href="categoria.html">Categorías</a>
          <a href="profesionales.php" class="active">Profesionales</a>
          <a href="nosotros.html">Nosotros</a>
          <a href="contacto.html">Contacto</a>
        </nav>
        <div class="header-actions">
          <a class="btn btn-outline" href="login.html">Iniciar sesión</a>
          <a class="btn btn-primary" href="index.html#buscar">Buscar</a>
        </div>
      </div>
    </header>

    <main class="page-shell">
      <div class="container">
        <?php if (!$p): ?>
          <section style="text-align:center; padding: 60px 0;">
            <span class="eyebrow eyebrow-dark">Error 404</span>
            <h1>No encontramos este profesional</h1>
            <p style="margin-bottom: 24px;">El perfil no existe o ya no está disponible.</p>
            <a class="btn btn-primary" href="profesionales.php">Ver profesionales</a>
          </section>
        <?php else: ?>
          <section class="profile-grid">
            <article class="profile-card">
              <div class="profile-summary">
                <?php if ($p['foto']): ?>
                  <img class="profile-pic" src="<?= e($p['foto']) ?>" alt="<?= $nombreCompleto ?>" width="92" height="92" />
                <?php else: ?>
                  <div class="profile-pic-placeholder" aria-hidden="true"><?= e(mb_strtoupper(mb_substr($p['nombre'], 0, 1))) ?></div>
                <?php endif; ?>
                <div>
                  <span class="status-badge">● Cuenta activa</span>
                  <h2><?= $nombreCompleto ?></h2>
                  <p><?= e($p['especialidad'] ?: 'Especialidad no informada') ?> · <?= e($p['zona'] ?: 'Zona no informada') ?></p>
                </div>
              </div>
              <div class="quick-stats">
                <div class="score-pill">Sin calificaciones aún</div>
                <strong>Miembro desde <?= (new DateTime($p['creado_en']))->format('m/Y') ?></strong>
              </div>
              <?php if ($p['bio']): ?>
                <p style="margin-top: 18px;"><?= nl2br(e($p['bio'])) ?></p>
              <?php endif; ?>
            </article>

            <aside class="profile-card">
              <span class="eyebrow eyebrow-dark">Contratar</span>
              <h2><?= $p['precio_base'] ? e($p['precio_base']) : 'A cotizar' ?></h2>
              <p style="margin-bottom: 20px;">Pedí presupuesto y coordiná el trabajo directamente con FIXYA.</p>
              <ul class="feature-list" style="margin-bottom: 20px;">
                <li>Presupuesto sin cargo</li>
                <li>Pago seguro con Mercado Pago</li>
                <li>Seguimiento del trabajo</li>
              </ul>
              <a class="btn btn-primary" href="contacto.html">Pedir presupuesto</a>
            </aside>
          </section>
        <?php endif; ?>
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
