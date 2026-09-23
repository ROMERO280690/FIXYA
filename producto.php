<?php
require_once __DIR__ . '/includes/categorias.php';

$catalogo = catalogoCategorias();
$slug = $_GET['s'] ?? 'plomeria';
if (!isset($catalogo[$slug])) {
    http_response_code(404);
    $slug = 'plomeria';
}
$cat = $catalogo[$slug];

function e(string $v): string { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); }
?>
<!DOCTYPE html>
<html lang="es-AR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><?= e($cat['nombre']) ?> | FIXYA.io</title>
    <link rel="canonical" href="https://fixya.io/producto.php?s=<?= e($slug) ?>" />
    <meta name="description" content="<?= e($cat['descripcion']) ?>" />
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
    <meta property="og:title" content="<?= e($cat['nombre']) ?> | FIXYA.io" />
    <meta property="og:description" content="<?= e($cat['descripcion']) ?>" />
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
          <a href="categoria.html" class="active">Categorías</a>
          <a href="profesionales.html">Profesionales</a>
          <a href="nosotros.html">Nosotros</a>
          <a href="contacto.html">Contacto</a>
        </nav>
        <div class="header-actions">
          <a class="btn btn-outline" href="login.html">Iniciar sesión</a>
          <a class="btn btn-primary" href="checkout.html?servicio=<?= e($slug) ?>">Pagar</a>
        </div>
      </div>
    </header>

    <main class="page-shell">
      <div class="container">
        <section class="page-head">
          <div class="page-head-copy">
            <span class="eyebrow eyebrow-dark"><?= e($cat['nombre']) ?></span>
            <h1><?= e($cat['titulo']) ?></h1>
            <p><?= e($cat['descripcion']) ?></p>
            <div class="page-actions">
              <a class="btn btn-primary" href="checkout.html?servicio=<?= e($slug) ?>">Solicitar servicio</a>
              <a class="btn btn-outline" href="categoria.html">Volver a categorías</a>
            </div>
          </div>
          <div class="page-head-card">
            <img src="<?= e($cat['imagen']) ?>" alt="<?= e($cat['nombre']) ?> FIXYA" width="960" height="540" loading="lazy" decoding="async" />
          </div>
        </section>

        <section class="product-detail-grid">
          <div class="content-card">
            <h2>Galería</h2>
            <div class="gallery-grid">
              <?php foreach ($cat['galeria'] as $img): ?>
                <img src="<?= e($img) ?>" alt="Trabajo de <?= e($cat['nombre']) ?>" width="960" height="540" loading="lazy" decoding="async" />
              <?php endforeach; ?>
            </div>
          </div>

          <aside class="checkout-card">
            <h2>Cotización a medida</h2>
            <p>El costo depende del trabajo. Contanos qué necesitás y recibís un presupuesto sin cargo antes de confirmar.</p>
            <ul class="feature-list">
              <li>Presupuesto sin cargo</li>
              <li>Precio transparente antes de empezar</li>
              <li>Pago seguro con Mercado Pago</li>
              <li>Profesionales verificados</li>
            </ul>
            <div class="page-actions">
              <a class="btn btn-primary" href="checkout.html?servicio=<?= e($slug) ?>">Contratar</a>
              <a class="btn btn-outline" href="profesionales.html">Ver profesionales</a>
            </div>
          </aside>
        </section>

        <section class="page-head" style="margin-top: 28px;">
          <div class="content-card">
            <h2>Qué incluye</h2>
            <ul class="feature-list">
              <?php foreach ($cat['incluye'] as $item): ?>
                <li><?= e($item) ?></li>
              <?php endforeach; ?>
            </ul>
          </div>
          <div class="content-card">
            <h2>Cuándo pedirlo</h2>
            <ul class="feature-list">
              <?php foreach ($cat['cuando'] as $item): ?>
                <li><?= e($item) ?></li>
              <?php endforeach; ?>
            </ul>
          </div>
        </section>
      </div>
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
          <ul><li><a href="nosotros.html">Nosotros</a></li><li><a href="profesionales.html">Profesionales</a></li><li><a href="contacto.html">Contacto</a></li><li><a href="privacidad.html">Privacidad</a></li><li><a href="terminos.html">Términos</a></li></ul>
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
