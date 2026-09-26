<?php
require_once __DIR__ . '/includes/auth.php';
require_once __DIR__ . '/includes/csrf.php';

$admin = requerirAdmin('login.html');

function e(?string $v): string { return htmlspecialchars($v ?? '', ENT_QUOTES, 'UTF-8'); }

$solicitudes = db()->query('SELECT * FROM service_requests ORDER BY creado_en DESC LIMIT 100')->fetchAll();
$mensajes = db()->query('SELECT * FROM contact_messages ORDER BY creado_en DESC LIMIT 100')->fetchAll();
$profesionales = db()->query("SELECT id, nombre, apellido, email, especialidad, zona, creado_en FROM users WHERE tipo_usuario = 'profesional' ORDER BY creado_en DESC")->fetchAll();
$totalClientes = (int)db()->query("SELECT COUNT(*) FROM users WHERE tipo_usuario = 'cliente'")->fetchColumn();
$pendientes = (int)db()->query("SELECT COUNT(*) FROM service_requests WHERE estado = 'pendiente'")->fetchColumn();

$estadoLabel = ['pendiente' => 'Pendiente', 'contactado' => 'Contactado', 'cerrado' => 'Cerrado'];
?>
<!DOCTYPE html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin | FIXYA.io</title>
    <meta name="robots" content="noindex, nofollow" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css" />
    <link rel="icon" type="image/png" sizes="32x32" href="assets/extras/favicon-32.png" />
    <meta name="theme-color" content="#0b1f3a" />
  </head>
  <body>
    <div class="topbar">
      <div class="container topbar-inner">
        <div class="topbar-links">
          <span>Panel de administración</span>
        </div>
        <div class="topbar-meta">
          <span><?= e($admin['nombre']) ?></span>
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
          <a href="admin.php" class="active">Admin</a>
          <a href="perfil.php">Mi perfil</a>
          <a href="dashboard.php">Dashboard</a>
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
            <span class="eyebrow eyebrow-dark">Admin</span>
            <h1>Panel de gestión</h1>
            <p>Solicitudes de servicio, mensajes de contacto y profesionales registrados.</p>
          </div>
        </div>

        <section class="metrics-grid">
          <article class="metric-box">
            <strong><?= count($solicitudes) ?></strong>
            <span>Solicitudes de servicio</span>
          </article>
          <article class="metric-box">
            <strong><?= $pendientes ?></strong>
            <span>Pendientes</span>
          </article>
          <article class="metric-box">
            <strong><?= count($profesionales) ?></strong>
            <span>Profesionales</span>
          </article>
          <article class="metric-box">
            <strong><?= $totalClientes ?></strong>
            <span>Clientes</span>
          </article>
        </section>

        <section class="dashboard-card" style="margin-top: 24px;">
          <h3>Solicitudes de servicio (checkout)</h3>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Contacto</th>
                  <th>Servicio</th>
                  <th>Descripción</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <?php if (empty($solicitudes)): ?>
                  <tr><td colspan="6">Todavía no hay solicitudes.</td></tr>
                <?php endif; ?>
                <?php foreach ($solicitudes as $s): ?>
                  <tr>
                    <td><?= e((new DateTime($s['creado_en']))->format('d/m H:i')) ?></td>
                    <td><?= e($s['nombre'] . ' ' . $s['apellido']) ?></td>
                    <td><?= e($s['email']) ?><br><?= e($s['telefono']) ?></td>
                    <td><?= e($s['servicio']) ?></td>
                    <td style="max-width: 220px;"><?= e(mb_strimwidth($s['descripcion'] ?? '', 0, 100, '…')) ?></td>
                    <td>
                      <select class="admin-estado" data-id="<?= (int)$s['id'] ?>" style="min-height:36px; padding:4px 8px; border-radius:8px; border:1px solid rgba(11,31,58,0.12);">
                        <?php foreach ($estadoLabel as $valor => $etiqueta): ?>
                          <option value="<?= $valor ?>" <?= $s['estado'] === $valor ? 'selected' : '' ?>><?= $etiqueta ?></option>
                        <?php endforeach; ?>
                      </select>
                    </td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </section>

        <section class="dashboard-card" style="margin-top: 24px;">
          <h3>Mensajes de contacto</h3>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Interés</th>
                  <th>Mensaje</th>
                </tr>
              </thead>
              <tbody>
                <?php if (empty($mensajes)): ?>
                  <tr><td colspan="5">Todavía no hay mensajes.</td></tr>
                <?php endif; ?>
                <?php foreach ($mensajes as $m): ?>
                  <tr>
                    <td><?= e((new DateTime($m['creado_en']))->format('d/m H:i')) ?></td>
                    <td><?= e($m['nombre']) ?></td>
                    <td><?= e($m['email']) ?><br><?= e($m['telefono']) ?></td>
                    <td><?= e($m['interes']) ?></td>
                    <td style="max-width: 260px;"><?= e(mb_strimwidth($m['mensaje'], 0, 120, '…')) ?></td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </section>

        <section class="dashboard-card" style="margin-top: 24px;">
          <h3>Profesionales registrados</h3>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Especialidad</th>
                  <th>Zona</th>
                </tr>
              </thead>
              <tbody>
                <?php if (empty($profesionales)): ?>
                  <tr><td colspan="5">Todavía no hay profesionales registrados.</td></tr>
                <?php endif; ?>
                <?php foreach ($profesionales as $pr): ?>
                  <tr>
                    <td><?= e((new DateTime($pr['creado_en']))->format('d/m/Y')) ?></td>
                    <td><?= e($pr['nombre'] . ' ' . $pr['apellido']) ?></td>
                    <td><?= e($pr['email']) ?></td>
                    <td><?= e($pr['especialidad'] ?: '—') ?></td>
                    <td><?= e($pr['zona'] ?: '—') ?></td>
                  </tr>
                <?php endforeach; ?>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>

    <footer class="site-footer">
      <div class="container footer-bottom">
        <span>© <span id="year"></span> FIXYA</span>
        <span>Panel interno</span>
      </div>
    </footer>

    <script>
      const csrfAdmin = <?= json_encode(csrfToken()) ?>;
      document.querySelectorAll('.admin-estado').forEach((select) => {
        select.addEventListener('change', async () => {
          const id = select.dataset.id;
          const estado = select.value;
          try {
            await fetch('api/admin_estado.php', {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id, estado, csrf: csrfAdmin }),
            });
          } catch (e) {
            window.alert('No se pudo actualizar el estado.');
          }
        });
      });
      const yearEl = document.getElementById('year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();
    </script>
  </body>
</html>
