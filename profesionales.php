<?php
require_once __DIR__ . '/includes/db.php';

function e(?string $v): string { return htmlspecialchars($v ?? '', ENT_QUOTES, 'UTF-8'); }

$servicioFiltro = trim($_GET['servicio'] ?? '');
$zonaFiltro = trim($_GET['zona'] ?? '');

$sql = "SELECT id, nombre, apellido, especialidad, zona, precio_base, bio, foto FROM users WHERE tipo_usuario = 'profesional'";
$params = [];
if ($servicioFiltro !== '') {
    $sql .= ' AND especialidad LIKE ?';
    $params[] = '%' . $servicioFiltro . '%';
}
if ($zonaFiltro !== '') {
    $sql .= ' AND zona LIKE ?';
    $params[] = '%' . $zonaFiltro . '%';
}
$sql .= ' ORDER BY creado_en DESC';

$stmt = db()->prepare($sql);
$stmt->execute($params);
$profesionales = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Profesionales | FIXYA</title>
    <link rel="canonical" href="https://fixya.io/profesionales.php" />
    <meta name="description" content="Profesionales registrados en FIXYA: plomería, gas, electricidad y más." />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="styles.css" />
    <link rel="icon" type="image/png" sizes="32x32" href="assets/extras/favicon-32.png" />
    <link rel="apple-touch-icon" href="assets/extras/favicon-180.png" />
    <meta name="theme-color" content="#0b1f3a" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="FIXYA.io" />
    <meta property="og:locale" content="es_AR" />
    <meta property="og:title" content="Profesionales | FIXYA" />
    <meta property="og:description" content="Profesionales registrados en FIXYA: plomería, gas, electricidad y más." />
    <meta property="og:image" content="https://fixya.io/assets/marketing/og-share.jpg" />
    <meta name="twitter:card" content="summary_large_image" />
  </head>
  <body>
    <div class="topbar">
      <div class="container topbar-inner">
        <div class="topbar-links">
          <a href="tel:+5493873522920">+54 9 387 352-2920</a>
          <a href="mailto:info@fixya.io">info@fixya.io</a>
        </div>
        <div class="topbar-meta">
          <span>✓ Mercado Pago</span>
          <span>✓ Identidad revisada</span>
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
          <a class="btn btn-outline" href="registro.html">Quiero ser parte</a>
          <a class="btn btn-primary" href="index.html#buscar">Buscar</a>
        </div>
      </div>
    </header>

    <main>
      <section class="page-hero" style="background: linear-gradient(180deg,#eef6f1 0%,#f9fbfd 100%);">
        <div class="container page-hero-grid">
          <div>
            <span class="eyebrow eyebrow-dark">Profesionales</span>
            <h1>La red de técnicos de FIXYA</h1>
            <p>Conectamos a profesionales con clientes reales, con búsqueda local, documentación y un flujo de trabajo seguro para cada contratación.</p>
          </div>
          <div class="page-hero-card">
            <img src="assets/corporativas/corp-05-cliente-tecnico.webp" alt="Profesional de FIXYA" width="960" height="540" loading="lazy" decoding="async" />
          </div>
        </div>
      </section>

      <section class="section">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow eyebrow-dark">Red activa</span>
            <h2><?= count($profesionales) ?> profesional<?= count($profesionales) === 1 ? '' : 'es' ?> registrado<?= count($profesionales) === 1 ? '' : 's' ?><?= $servicioFiltro || $zonaFiltro ? ' para tu búsqueda' : '' ?></h2>
          </div>

          <?php if (empty($profesionales)): ?>
            <div class="content-card" style="text-align:center; padding: 48px;">
              <p style="margin-bottom: 18px;">
                <?php if ($servicioFiltro || $zonaFiltro): ?>
                  Todavía no hay profesionales registrados que coincidan con tu búsqueda.
                <?php else: ?>
                  Todavía no hay profesionales registrados en la plataforma. ¡Sé el primero en sumarte!
                <?php endif; ?>
              </p>
              <a class="btn btn-primary" href="registro.html">Registrarme como profesional</a>
            </div>
          <?php else: ?>
            <div class="pro-grid">
              <?php foreach ($profesionales as $p): ?>
                <?php $nombreCompleto = e($p['nombre'] . ' ' . $p['apellido']); ?>
                <article class="pro-card">
                  <div class="pro-body" style="padding-top: 24px;">
                    <div class="user-meta">
                      <?php if ($p['foto']): ?>
                        <img class="avatar" src="<?= e($p['foto']) ?>" alt="<?= $nombreCompleto ?>" width="48" height="48" loading="lazy" decoding="async" />
                      <?php else: ?>
                        <div class="avatar-placeholder" aria-hidden="true"><?= e(mb_strtoupper(mb_substr($p['nombre'], 0, 1))) ?></div>
                      <?php endif; ?>
                      <div>
                        <h3><?= $nombreCompleto ?></h3>
                        <p><?= e($p['zona'] ?: 'Zona no informada') ?> · <?= e($p['especialidad'] ?: 'Especialidad no informada') ?></p>
                      </div>
                    </div>
                    <?php if ($p['bio']): ?><p style="margin: 12px 0;"><?= e(mb_strimwidth($p['bio'], 0, 140, '…')) ?></p><?php endif; ?>
                    <div class="price-row">
                      <div>
                        <small>Precio base</small>
                        <strong><?= $p['precio_base'] ? e($p['precio_base']) : 'A cotizar' ?></strong>
                      </div>
                      <a href="profesional.php?id=<?= (int)$p['id'] ?>" class="btn btn-primary btn-small">Ver perfil</a>
                    </div>
                  </div>
                </article>
              <?php endforeach; ?>
            </div>
          <?php endif; ?>
        </div>
      </section>

      <section class="section alt-section">
        <div class="container">
          <div class="section-head">
            <span class="eyebrow eyebrow-dark">¿Por qué trabajar con nosotros?</span>
            <h2>Una plataforma hecha para escalar tu negocio</h2>
          </div>

          <div class="feature-grid">
            <article class="feature-card">
              <img src="assets/features/feat-cobertura.webp" alt="Cobertura" width="192" height="192" loading="lazy" decoding="async" />
              <h3>Más leads</h3>
              <p>Accedés a clientes activos en tu zona y área de trabajo.</p>
            </article>
            <article class="feature-card">
              <img src="assets/ui/ui-expediente.webp" alt="Expediente" width="192" height="192" loading="lazy" decoding="async" />
              <h3>Documentación ordenada</h3>
              <p>Todos tus trabajos y presupuestos quedan organizados.</p>
            </article>
            <article class="feature-card">
              <img src="assets/features/feat-soporte.webp" alt="Agenda" width="192" height="192" loading="lazy" decoding="async" />
              <h3>Gestión más simple</h3>
              <p>Mensajes, pedidos y seguimiento en un mismo lugar.</p>
            </article>
            <article class="feature-card">
              <img src="assets/ui/ui-mercado-pago.webp" alt="Cobros" width="192" height="192" loading="lazy" decoding="async" />
              <h3>Cobros con confianza</h3>
              <p>Integración con pagos seguros y trazables.</p>
            </article>
          </div>
        </div>
      </section>

      <section class="section cta-section">
        <div class="container cta-box">
          <div>
            <span class="eyebrow eyebrow-dark">Quiero sumar mi negocio</span>
            <h2>Sumate a la red FIXYA</h2>
          </div>
          <div class="cta-actions">
            <a class="btn btn-primary" href="registro.html">Registrarme</a>
            <a class="btn btn-outline btn-dark" href="mailto:info@fixya.io">Escribir por email</a>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="container footer-grid">
        <div>
          <img src="assets/logos/logo-blanco.png" alt="FIXYA" class="footer-logo" width="400" height="108" loading="lazy" decoding="async" />
          <p>Marketplace de servicios con profesionales verificados y pago seguro.</p>
        </div>
        <div>
          <h3>Servicios</h3>
          <ul><li><a href="producto.php?s=plomeria">Plomería</a></li><li><a href="producto.php?s=electricidad">Electricidad</a></li><li><a href="producto.php?s=gas">Gas</a></li><li><a href="producto.php?s=pintura">Pintura</a></li><li><a href="categoria.html">Ver todas</a></li></ul>
        </div>
        <div>
          <h3>Empresa</h3>
          <ul><li><a href="nosotros.html">Nosotros</a></li><li><a href="servicios.html">Servicios</a></li><li><a href="contacto.html">Contacto</a></li><li><a href="privacidad.html">Privacidad</a></li><li><a href="terminos.html">Términos</a></li></ul>
        </div>
        <div>
          <h3>Contacto</h3>
          <ul><li><a href="tel:+5493873522920">+54 9 387 352-2920</a></li><li><a href="mailto:info@fixya.io">info@fixya.io</a></li><li>Salta, Argentina</li></ul>
        </div>
      </div>
      <div class="container footer-bottom">
        <span>© <span id="year"></span> FIXYA</span>
        <span>Todos los derechos reservados</span>
      </div>
    </footer>

    <script src="script.js"></script>
  </body>
</html>
