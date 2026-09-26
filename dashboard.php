<?php
require_once __DIR__ . '/includes/auth.php';

$usuario = requerirSesion('login.html');
$nombreCompleto = htmlspecialchars($usuario['nombre'] . ' ' . $usuario['apellido'], ENT_QUOTES, 'UTF-8');
?>
<!DOCTYPE html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dashboard | FIXYA.io</title>
    <meta name="description" content="Panel profesional de FIXYA.io." />
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
          <span>✓ Panel profesional</span>
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
          <a href="perfil.php">Perfil</a>
          <a href="dashboard.php" class="active">Dashboard</a>
          <a href="servicios.html">Servicios</a>
          <?php if (!empty($usuario['es_admin'])): ?><a href="admin.php">Admin</a><?php endif; ?>
        </nav>
        <div class="header-actions">
          <a class="btn btn-outline" href="api/logout.php">Salir</a>
        </div>
      </div>
    </header>

    <main class="page-shell">
      <div class="container">
        <div class="page-head">
          <div class="page-head-copy">
            <span class="eyebrow eyebrow-dark">Dashboard</span>
            <h1>Hola, <?= $nombreCompleto ?></h1>
            <p>Controlá pedidos, seguimiento y rendimiento de tu actividad en FIXYA.</p>
          </div>
        </div>

        <section class="metrics-grid">
          <article class="metric-box">
            <strong>0</strong>
            <span>Servicios este mes</span>
          </article>
          <article class="metric-box">
            <strong>$0</strong>
            <span>Ingresos</span>
          </article>
          <article class="metric-box">
            <strong>—</strong>
            <span>Calificación</span>
          </article>
          <article class="metric-box">
            <strong>0</strong>
            <span>Solicitudes nuevas</span>
          </article>
        </section>

        <section class="dashboard-grid" style="margin-top: 24px;">
          <div class="dashboard-card">
            <h3>Solicitudes recientes</h3>
            <div class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Servicio</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td colspan="3">Todavía no tenés solicitudes asignadas.</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="dashboard-card">
            <h3>Agenda</h3>
            <ul class="timeline-list">
              <li>No tenés turnos programados.</li>
            </ul>
          </div>
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
