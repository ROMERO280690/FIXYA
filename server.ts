import express, { Request, Response, NextFunction } from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import {
  usersStore,
  contactMessagesStore,
  serviceRequestsStore,
  reviewsStore,
  presupuestosStore,
  arrepentimientosStore,
  bajasSuscripcionStore,
  getNextUserId,
  getNextContactId,
  getNextServiceId,
  getNextReviewId,
  getNextPresupuestoId,
  getNextArrepentimientoId,
  getNextBajaId,
  getReviewsForProfessional,
  getProRating,
  User,
  ServiceRequest,
  PresupuestoFormal,
  SolicitudArrepentimiento,
  SolicitudBajaSuscripcion,
} from './src/data/store.js';
import { catalogoCategorias } from './src/data/categories.js';

declare module 'express-session' {
  interface SessionData {
    userId?: number;
    loginAttempts?: number;
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads', 'profesionales');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage for profile photos
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, 'foto-' + unique + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formato no permitido. Solo JPG, PNG o WEBP.'));
    }
  },
});

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fixya-secret-salt-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }) as any
);

// Serve static assets from project root and uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(__dirname, { extensions: ['html'] }));

// Helper: current user
function getCurrentUser(req: Request): User | null {
  if (!req.session.userId) return null;
  return usersStore.find((u) => u.id === req.session.userId) || null;
}

// Fixed CSRF token for forms
const CSRF_TOKEN = 'fixya-csrf-valid-token-2025';

// ----------------- Clean Route Handlers for Static Pages -----------------
const staticPageMap: Record<string, string> = {
  '/': 'index.html',
  '/inicio': 'index.html',
  '/index.html': 'index.html',
  '/servicios': 'servicios.html',
  '/servicios.html': 'servicios.html',
  '/servicios.php': 'servicios.html',
  '/categoria': 'categoria.html',
  '/categorias': 'categoria.html',
  '/categoria.html': 'categoria.html',
  '/categoria.php': 'categoria.html',
  '/planes-pro': 'planes-pro.html',
  '/planes-pro.html': 'planes-pro.html',
  '/planes-pro.php': 'planes-pro.html',
  '/checkout': 'checkout.html',
  '/checkout.html': 'checkout.html',
  '/checkout.php': 'checkout.html',
  '/contacto': 'contacto.html',
  '/contacto.html': 'contacto.html',
  '/contacto.php': 'contacto.html',
  '/nosotros': 'nosotros.html',
  '/nosotros.html': 'nosotros.html',
  '/nosotros.php': 'nosotros.html',
  '/login': 'login.html',
  '/login.html': 'login.html',
  '/login.php': 'login.html',
  '/registro': 'registro.html',
  '/registro.html': 'registro.html',
  '/registro.php': 'registro.html',
  '/terminos': 'terminos.html',
  '/terminos.html': 'terminos.html',
  '/terminos.php': 'terminos.html',
  '/privacidad': 'privacidad.html',
  '/privacidad.html': 'privacidad.html',
  '/privacidad.php': 'privacidad.html',
  '/arrepentimiento': 'arrepentimiento.html',
  '/arrepentimiento.html': 'arrepentimiento.html',
  '/baja': 'baja.html',
  '/baja.html': 'baja.html',
};

for (const [routePath, fileName] of Object.entries(staticPageMap)) {
  app.get(routePath, (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, fileName));
  });
}

// ----------------- Dynamic Pages -----------------

// Profesionales listing
app.get(['/profesionales', '/profesionales.php', '/profesionales.html'], (req: Request, res: Response) => {
  const servicioFiltro = typeof req.query.servicio === 'string' ? req.query.servicio.trim() : '';
  const zonaFiltro = typeof req.query.zona === 'string' ? req.query.zona.trim() : '';

  let list = usersStore.filter((u) => u.tipo_usuario === 'profesional');

  if (servicioFiltro) {
    const query = servicioFiltro.toLowerCase();
    list = list.filter(
      (u) =>
        (u.especialidad && u.especialidad.toLowerCase().includes(query)) ||
        (u.bio && u.bio.toLowerCase().includes(query))
    );
  }

  if (zonaFiltro) {
    const query = zonaFiltro.toLowerCase();
    list = list.filter((u) => u.zona && u.zona.toLowerCase().includes(query));
  }

  // Attach rating info and sort PRO featured professionals first
  const profesionalesConRating = list.map((p) => {
    const ratingInfo = getProRating(p.id);
    return {
      ...p,
      ratingMedia: ratingInfo.average,
      totalResenas: ratingInfo.count,
    };
  });

  profesionalesConRating.sort((a, b) => {
    if (a.destacado && !b.destacado) return -1;
    if (!a.destacado && b.destacado) return 1;
    return (b.ratingMedia || 0) - (a.ratingMedia || 0);
  });

  res.render('profesionales', {
    profesionales: profesionalesConRating,
    servicioFiltro,
    zonaFiltro,
    currentUser: getCurrentUser(req),
  });
});

// Profesional single detail
app.get(['/profesional', '/profesional.php', '/profesional.html'], (req: Request, res: Response) => {
  const id = parseInt(String(req.query.id || '0'), 10);
  const p = usersStore.find((u) => u.id === id && u.tipo_usuario === 'profesional') || null;

  if (!p) {
    res.status(404);
  }

  const reviews = p ? getReviewsForProfessional(p.id) : [];
  const ratingInfo = p ? getProRating(p.id) : { average: 5.0, count: 0 };

  res.render('profesional', {
    p,
    reviews,
    ratingMedia: ratingInfo.average,
    totalResenas: ratingInfo.count,
    currentUser: getCurrentUser(req),
  });
});

// Producto (category details)
app.get(['/producto', '/producto.php', '/producto.html'], (req: Request, res: Response) => {
  let slug = typeof req.query.s === 'string' ? req.query.s.toLowerCase() : 'plomeria';
  if (!catalogoCategorias[slug]) {
    slug = 'plomeria';
  }
  const cat = catalogoCategorias[slug];
  const queryCat = cat.nombre.toLowerCase();
  const profesionalesRelacionados = usersStore.filter(
    (u) =>
      u.tipo_usuario === 'profesional' &&
      ((u.especialidad &&
        (u.especialidad.toLowerCase().includes(slug) ||
          u.especialidad.toLowerCase().includes(queryCat))) ||
        (u.bio && u.bio.toLowerCase().includes(queryCat)))
  );

  res.render('producto', {
    cat,
    slug,
    profesionalesRelacionados,
    todasCategorias: catalogoCategorias,
    currentUser: getCurrentUser(req),
  });
});

// Perfil (logged-in user)
app.get(['/perfil', '/perfil.php', '/perfil.html'], (req: Request, res: Response) => {
  const usuario = getCurrentUser(req);
  if (!usuario) {
    return res.redirect('/login');
  }

  const nombreCompleto = usuario.nombre + ' ' + usuario.apellido;
  const inicial = (usuario.nombre || 'U').charAt(0).toUpperCase();

  res.render('perfil', {
    usuario,
    nombreCompleto,
    inicial,
    especialidad: usuario.especialidad || 'Sin especialidad definida',
    zona: usuario.zona || 'Zona no definida',
    precioBase: usuario.precio_base || '',
    bio: usuario.bio || '',
    esProfesional: usuario.tipo_usuario === 'profesional',
    guardadoOk: false,
    errorFoto: null,
    csrfToken: CSRF_TOKEN,
  });
});

// Perfil POST (update)
app.post(
  ['/perfil', '/perfil.php'],
  (req: Request, res: Response, next: NextFunction) => {
    (upload.single('foto') as any)(req, res, (err: any) => {
      if (err) {
        const usuario = getCurrentUser(req);
        if (!usuario) return res.redirect('/login');
        return res.render('perfil', {
          usuario,
          nombreCompleto: usuario.nombre + ' ' + usuario.apellido,
          inicial: (usuario.nombre || 'U').charAt(0).toUpperCase(),
          especialidad: usuario.especialidad || 'Sin especialidad definida',
          zona: usuario.zona || 'Zona no definida',
          precioBase: usuario.precio_base || '',
          bio: usuario.bio || '',
          esProfesional: usuario.tipo_usuario === 'profesional',
          guardadoOk: false,
          errorFoto: err.message || 'Error al subir la imagen.',
          csrfToken: CSRF_TOKEN,
        });
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    const usuario = getCurrentUser(req);
    if (!usuario) {
      return res.redirect('/login');
    }

    const especialidad = String(req.body['especialidad'] || '').trim();
    const zona = String(req.body['zona'] || '').trim();
    const precioBase = String(req.body['precio-base'] || '').trim();
    const bio = String(req.body['bio'] || '').trim();
    const telefono = String(req.body['telefono'] || '').trim();
    const matricula = String(req.body['matricula'] || '').trim();

    usuario.especialidad = especialidad || null;
    usuario.zona = zona || null;
    usuario.precio_base = precioBase || null;
    usuario.bio = bio || null;
    if (telefono) usuario.telefono = telefono;
    if (matricula) usuario.matricula = matricula;

    if (req.file) {
      usuario.foto = '/uploads/profesionales/' + req.file.filename;
    }

    const nombreCompleto = usuario.nombre + ' ' + usuario.apellido;
    const inicial = (usuario.nombre || 'U').charAt(0).toUpperCase();

    res.render('perfil', {
      usuario,
      nombreCompleto,
      inicial,
      especialidad: usuario.especialidad || 'Sin especialidad definida',
      zona: usuario.zona || 'Zona no definida',
      precioBase: usuario.precio_base || '',
      bio: usuario.bio || '',
      esProfesional: usuario.tipo_usuario === 'profesional',
      guardadoOk: true,
      errorFoto: null,
      csrfToken: CSRF_TOKEN,
    });
  }
);

// Dashboard
app.get(['/dashboard', '/dashboard.php', '/dashboard.html'], (req: Request, res: Response) => {
  const usuario = getCurrentUser(req);
  if (!usuario) {
    return res.redirect('/login');
  }

  const nombreCompleto = usuario.nombre + ' ' + usuario.apellido;
  const esProfesional = usuario.tipo_usuario === 'profesional';

  // Requests relevant to this user
  const solicitudes = esProfesional
    ? serviceRequestsStore
    : serviceRequestsStore.filter(
        (s) =>
          s.email.toLowerCase() === usuario.email.toLowerCase() ||
          s.nombre.toLowerCase().includes(usuario.nombre.toLowerCase())
      );

  // Presupuestos (Art. 21 Ley 24.240)
  const presupuestosUsuario = esProfesional
    ? presupuestosStore.filter((p) => p.profesional_id === usuario.id)
    : presupuestosStore.filter(
        (p) =>
          p.cliente_email.toLowerCase() === usuario.email.toLowerCase() ||
          solicitudes.some((s) => s.id === p.solicitud_id)
      );

  // Solicitudes de arrepentimiento (Res. 424/2020)
  const arrepentimientosUsuario = arrepentimientosStore.filter(
    (a) =>
      a.email.toLowerCase() === usuario.email.toLowerCase() ||
      solicitudes.some((s) => s.id === a.solicitud_id)
  );

  // Bajas de suscripción (Res. 271/2020)
  const bajasUsuario = bajasSuscripcionStore.filter(
    (b) => b.usuario_id === usuario.id || b.email.toLowerCase() === usuario.email.toLowerCase()
  );

  res.render('dashboard', {
    usuario,
    nombreCompleto,
    esProfesional,
    solicitudesAsignadas: solicitudes,
    presupuestos: presupuestosUsuario,
    arrepentimientos: arrepentimientosUsuario,
    bajas: bajasUsuario,
    estadoLabel: {
      pendiente: 'Pendiente',
      contactado: 'Contactado',
      en_proceso: 'En proceso',
      cerrado: 'Concluido',
      cancelado: 'Cancelado',
    },
    csrfToken: CSRF_TOKEN,
  });
});

// Admin portal
app.get(['/admin', '/admin.php', '/admin.html'], (req: Request, res: Response) => {
  const admin = getCurrentUser(req);
  if (!admin) {
    return res.redirect('/login');
  }
  if (!admin.es_admin) {
    return res.status(403).send('No autorizado. Se requieren permisos de administrador.');
  }

  const profesionales = usersStore.filter((u) => u.tipo_usuario === 'profesional');
  const clientes = usersStore.filter((u) => u.tipo_usuario === 'cliente' && !u.es_admin);
  const pendientes = serviceRequestsStore.filter((s) => s.estado === 'pendiente').length;

  res.render('admin', {
    admin,
    solicitudes: serviceRequestsStore,
    mensajes: contactMessagesStore,
    profesionales,
    clientes,
    totalClientes: clientes.length,
    pendientes,
    estadoLabel: {
      pendiente: 'Pendiente',
      contactado: 'Contactado',
      en_proceso: 'En proceso',
      cerrado: 'Concluido',
      cancelado: 'Cancelado',
    },
    csrfToken: CSRF_TOKEN,
  });
});

// ----------------- API Endpoints -----------------

// CSRF token endpoint
app.get(['/api/csrf', '/api/csrf.php'], (_req: Request, res: Response) => {
  res.json({ ok: true, token: CSRF_TOKEN });
});

// Current session endpoint
app.get('/api/me', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.json({ ok: true, loggedIn: false, user: null });
  }
  return res.json({
    ok: true,
    loggedIn: true,
    user: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      tipo_usuario: user.tipo_usuario,
      especialidad: user.especialidad,
      zona: user.zona,
      foto: user.foto,
      es_admin: user.es_admin,
      verificado: user.verificado,
      plan_pro: user.plan_pro || 'gratis',
      destacado: user.destacado || false,
      telefono: user.telefono,
    },
  });
});

// Public list of verified professionals
app.get(['/api/profesionales', '/api/profesionales.php'], (_req: Request, res: Response) => {
  const list = usersStore
    .filter((u) => u.tipo_usuario === 'profesional')
    .map((u) => {
      const rating = getProRating(u.id);
      return {
        id: u.id,
        nombre: u.nombre,
        apellido: u.apellido,
        especialidad: u.especialidad,
        zona: u.zona,
        precio_base: u.precio_base,
        bio: u.bio,
        foto: u.foto,
        verificado: u.verificado,
        plan_pro: u.plan_pro || 'gratis',
        destacado: u.destacado || false,
        ratingMedia: rating.average,
        totalResenas: rating.count,
      };
    });
  return res.json({ ok: true, data: list });
});

// Categories list API
app.get('/api/categorias', (_req: Request, res: Response) => {
  return res.json({ ok: true, data: catalogoCategorias });
});

// Live Instant Search API
app.get('/api/buscar', (req: Request, res: Response) => {
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ ok: true, categorias: [], profesionales: [] });
  }

  const categoriasMatches = Object.entries(catalogoCategorias)
    .filter(([slug, cat]) => {
      return (
        slug.includes(q) ||
        cat.nombre.toLowerCase().includes(q) ||
        cat.descripcion.toLowerCase().includes(q) ||
        cat.incluye.some((i) => i.toLowerCase().includes(q))
      );
    })
    .slice(0, 5)
    .map(([slug, cat]) => ({
      slug,
      nombre: cat.nombre,
      titulo: cat.titulo,
      icono: cat.icono,
      url: `/producto?s=${slug}`,
    }));

  const profesionalesMatches = usersStore
    .filter(
      (u) =>
        u.tipo_usuario === 'profesional' &&
        (`${u.nombre} ${u.apellido}`.toLowerCase().includes(q) ||
          (u.especialidad && u.especialidad.toLowerCase().includes(q)) ||
          (u.zona && u.zona.toLowerCase().includes(q)))
    )
    .slice(0, 5)
    .map((u) => ({
      id: u.id,
      nombre: `${u.nombre} ${u.apellido}`,
      especialidad: u.especialidad,
      zona: u.zona,
      foto: u.foto,
      url: `/profesional?id=${u.id}`,
    }));

  return res.json({
    ok: true,
    categorias: categoriasMatches,
    profesionales: profesionalesMatches,
  });
});

// Login endpoint
app.post(['/api/login', '/api/login.php'], (req: Request, res: Response) => {
  const { email, contrasena } = req.body || {};
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(contrasena || '');

  if (!cleanEmail || !cleanPassword) {
    return res.status(422).json({ ok: false, error: 'Ingresá tu email y contraseña.' });
  }

  const user = usersStore.find((u) => u.email.toLowerCase() === cleanEmail);
  if (!user || !bcrypt.compareSync(cleanPassword, user.password_hash)) {
    return res.status(401).json({ ok: false, error: 'Email o contraseña incorrectos.' });
  }

  req.session.userId = user.id;
  const redirectTarget = user.es_admin ? '/admin' : '/dashboard';
  return res.json({ ok: true, redirect: redirectTarget, user: { nombre: user.nombre, es_admin: user.es_admin } });
});

// Register endpoint
app.post(['/api/registro', '/api/registro.php'], (req: Request, res: Response) => {
  const body = req.body || {};
  const nombre = String(body.nombre || '').trim();
  const apellido = String(body.apellido || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.contrasena || '');
  const tipoRaw = String(body['tipo-de-usuario'] || 'Cliente');
  const tipoUsuario = tipoRaw.toLowerCase() === 'profesional' ? 'profesional' : 'cliente';

  const errores: string[] = [];
  if (!nombre) errores.push('El nombre es obligatorio.');
  if (!apellido) errores.push('El apellido es obligatorio.');
  if (!email || !email.includes('@')) errores.push('El email no es válido.');
  if (password.length < 8) errores.push('La contraseña debe tener al menos 8 caracteres.');

  if (errores.length > 0) {
    return res.status(422).json({ ok: false, error: errores.join(' ') });
  }

  const existing = usersStore.find((u) => u.email.toLowerCase() === email);
  if (existing) {
    return res.status(409).json({ ok: false, error: 'Ya existe una cuenta con ese email.' });
  }

  const newUser: User = {
    id: getNextUserId(),
    nombre,
    apellido,
    email,
    password_hash: bcrypt.hashSync(password, 10),
    tipo_usuario: tipoUsuario,
    especialidad: tipoUsuario === 'profesional' ? 'Especialista en servicios' : null,
    zona: 'Salta, Argentina',
    precio_base: null,
    bio: null,
    foto: null,
    es_admin: 0,
    verificado: tipoUsuario === 'cliente',
    plan_pro: 'gratis',
    destacado: false,
    creado_en: new Date().toISOString(),
  };

  usersStore.unshift(newUser);
  req.session.userId = newUser.id;

  return res.json({ ok: true, redirect: '/dashboard' });
});

// Logout endpoint
app.get(['/api/logout', '/api/logout.php'], (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// PRO Subscription endpoint (Monetización)
app.post(['/api/suscribir_pro', '/api/suscribir_pro.php'], (req: Request, res: Response) => {
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const plan = String(body.plan || 'pro').toLowerCase();

  if (!email || !email.includes('@')) {
    return res.status(422).json({ ok: false, error: 'Ingresá un email válido para la suscripción.' });
  }

  let user = usersStore.find((u) => u.email.toLowerCase() === email);
  if (!user && req.session.userId) {
    user = usersStore.find((u) => u.id === req.session.userId);
  }

  if (user) {
    user.tipo_usuario = 'profesional';
    user.plan_pro = (plan === 'empresa' ? 'empresa' : 'pro') as any;
    user.destacado = true;
    user.verificado = true;
  }

  const randomSub = Math.floor(100000 + Math.random() * 900000);
  const codigoMp = `MP-SUB-${randomSub}`;

  return res.json({
    ok: true,
    codigo_mp: codigoMp,
    plan: plan === 'empresa' ? 'Empresa & Cuadrillas' : 'Profesional PRO',
    mensaje: 'Suscripción FIXYA PRO activada exitosamente con Mercado Pago.',
  });
});

// Contact endpoint
app.post(['/api/contacto', '/api/contacto.php'], (req: Request, res: Response) => {
  const body = req.body || {};

  // Honeypot check
  if (body.sitio_web) {
    return res.json({ ok: true });
  }

  const nombre = String(body.nombre || '').trim();
  const email = String(body.email || '').trim();
  const telefono = String(body.telefono || '').trim();
  const interes = String(body.categoria || '').trim();
  const mensaje = String(body.mensaje || '').trim();

  const errores: string[] = [];
  if (!nombre) errores.push('El nombre es obligatorio.');
  if (!email || !email.includes('@')) errores.push('El email no es válido.');
  if (!mensaje) errores.push('El mensaje es obligatorio.');

  if (errores.length > 0) {
    return res.status(422).json({ ok: false, error: errores.join(' ') });
  }

  const msg = {
    id: getNextContactId(),
    nombre,
    email,
    telefono: telefono || null,
    interes: interes || null,
    mensaje,
    ip: req.ip || null,
    leido: false,
    creado_en: new Date().toISOString(),
  };

  contactMessagesStore.unshift(msg);

  return res.json({
    ok: true,
    mensaje: 'Consulta enviada. FIXYA te contactará a la brevedad.',
  });
});

// Checkout endpoint
app.post(['/api/checkout', '/api/checkout.php'], (req: Request, res: Response) => {
  const body = req.body || {};

  // Honeypot check
  if (body.sitio_web) {
    return res.json({ ok: true });
  }

  const nombre = String(body.nombre || '').trim();
  const apellido = String(body.apellido || '').trim();
  const email = String(body.email || '').trim();
  const telefono = String(body.telefono || '').trim();
  const servicio = String(body.servicio || '').trim();
  const zona = String(body.zona || '').trim();
  const urgencia = String(body.urgencia || '24hs').trim();
  const descripcion = String(body.descripcion || '').trim();
  const metodoPago = String(body.metodo_pago || 'mercadopago').trim();
  const proIdRaw = body.profesional_id ? parseInt(String(body.profesional_id), 10) : null;

  const errores: string[] = [];
  if (!nombre) errores.push('El nombre es obligatorio.');
  if (!apellido) errores.push('El apellido es obligatorio.');
  if (!email || !email.includes('@')) errores.push('El email no es válido.');
  if (!telefono) errores.push('El teléfono es obligatorio.');
  if (!servicio) errores.push('Elegí un servicio.');

  if (errores.length > 0) {
    return res.status(422).json({ ok: false, error: errores.join(' ') });
  }

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const codigoOrden = `FIX-${randomNum}`;

  const reqItem: ServiceRequest = {
    id: getNextServiceId(),
    codigo: codigoOrden,
    nombre,
    apellido,
    email,
    telefono,
    servicio,
    zona: zona || 'Salta',
    urgencia,
    profesional_id: proIdRaw || null,
    descripcion: descripcion || null,
    metodo_pago: metodoPago,
    estado: 'pendiente',
    monto_estimado: '$25.000 – $55.000',
    ip: req.ip || null,
    creado_en: new Date().toISOString(),
  };

  serviceRequestsStore.unshift(reqItem);

  return res.json({
    ok: true,
    codigo: codigoOrden,
    mensaje: `Contratación confirmada (Orden ${codigoOrden}). Te contactaremos para coordinar la visita.`,
  });
});

// Admin change status
app.post(['/api/admin_estado', '/api/admin_estado.php'], (req: Request, res: Response) => {
  const admin = getCurrentUser(req);
  if (!admin || !admin.es_admin) {
    return res.status(403).json({ ok: false, error: 'No autorizado' });
  }

  const id = parseInt(String(req.body.id || '0'), 10);
  const estado = String(req.body.estado || '');

  if (!['pendiente', 'contactado', 'en_proceso', 'cerrado', 'cancelado'].includes(estado)) {
    return res.status(422).json({ ok: false, error: 'Estado inválido.' });
  }

  const item = serviceRequestsStore.find((s) => s.id === id);
  if (item) {
    item.estado = estado as any;
  }

  return res.json({ ok: true, estado });
});

// User / Professional update status from Dashboard
app.post('/api/solicitud_estado', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ ok: false, error: 'Iniciá sesión para gestionar solicitudes.' });
  }

  const id = parseInt(String(req.body.id || '0'), 10);
  const nuevoEstado = String(req.body.estado || '');

  const validStates = ['pendiente', 'contactado', 'en_proceso', 'cerrado', 'cancelado'];
  if (!validStates.includes(nuevoEstado)) {
    return res.status(422).json({ ok: false, error: 'Estado no válido.' });
  }

  const requestItem = serviceRequestsStore.find((s) => s.id === id);
  if (!requestItem) {
    return res.status(404).json({ ok: false, error: 'Solicitud no encontrada.' });
  }

  // Permission check: admin, assigned professional, or request owner
  const isOwner = requestItem.email.toLowerCase() === user.email.toLowerCase();
  const isAssignedPro = user.tipo_usuario === 'profesional';
  const isAdmin = user.es_admin === 1;

  if (!isOwner && !isAssignedPro && !isAdmin) {
    return res.status(403).json({ ok: false, error: 'No tenés permisos para modificar esta solicitud.' });
  }

  requestItem.estado = nuevoEstado as any;

  return res.json({
    ok: true,
    mensaje: `Estado actualizado a "${nuevoEstado}".`,
    estado: nuevoEstado,
  });
});

// Admin toggle verified professional status
app.post('/api/admin_verificar_pro', (req: Request, res: Response) => {
  const admin = getCurrentUser(req);
  if (!admin || !admin.es_admin) {
    return res.status(403).json({ ok: false, error: 'No autorizado' });
  }

  const proId = parseInt(String(req.body.id || '0'), 10);
  const targetPro = usersStore.find((u) => u.id === proId && u.tipo_usuario === 'profesional');
  if (!targetPro) {
    return res.status(404).json({ ok: false, error: 'Profesional no encontrado.' });
  }

  targetPro.verificado = !targetPro.verificado;

  return res.json({
    ok: true,
    verificado: targetPro.verificado,
    mensaje: `Profesional ${targetPro.verificado ? 'verificado' : 'pausado'} con éxito.`,
  });
});

// Submit review for a professional
app.post('/api/resena', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const body = req.body || {};
  const proId = parseInt(String(body.profesional_id || '0'), 10);
  const estrellas = parseInt(String(body.estrellas || '5'), 10);
  const comentario = String(body.comentario || '').trim();
  const servicio = String(body.servicio || 'Servicio verificado').trim();

  if (!proId || !comentario) {
    return res.status(422).json({ ok: false, error: 'Comentario requerido.' });
  }

  const targetPro = usersStore.find((u) => u.id === proId && u.tipo_usuario === 'profesional');
  if (!targetPro) {
    return res.status(404).json({ ok: false, error: 'Profesional no encontrado.' });
  }

  const newReview = {
    id: getNextReviewId(),
    profesional_id: proId,
    cliente_nombre: user ? `${user.nombre} ${user.apellido.charAt(0)}.` : 'Cliente verificado',
    estrellas: Math.min(5, Math.max(1, estrellas)),
    comentario,
    servicio,
    zona: user?.zona || 'Salta',
    fecha: new Date().toISOString().split('T')[0],
  };

  reviewsStore.unshift(newReview);

  return res.json({
    ok: true,
    mensaje: 'Tu reseña fue publicada con éxito.',
    review: newReview,
  });
});

// ----------------- Legal Argentine Compliance APIs (Ley 24.240 & Resoluciones) -----------------

// Presupuesto Previo Obligatorio (Art. 21 Ley 24.240)
app.post('/api/presupuesto/crear', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  if (!user || user.tipo_usuario !== 'profesional') {
    return res.status(401).json({ ok: false, error: 'Solo profesionales autenticados pueden emitir presupuestos.' });
  }

  const body = req.body || {};
  const solicitudId = parseInt(String(body.solicitud_id || '0'), 10);
  const descripcion = String(body.descripcion_trabajo || '').trim();
  const manoDeObra = parseFloat(String(body.mano_de_obra || '0'));
  const materiales = parseFloat(String(body.materiales || '0'));
  let validezDias = parseInt(String(body.validez_dias || '10'), 10);
  const plazoEjecucion = parseInt(String(body.plazo_ejecucion_dias || '1'), 10);

  // Por ley 24.240 art. 21, la validez no puede ser inferior a 10 días corridos
  if (validezDias < 10) {
    validezDias = 10;
  }

  if (!solicitudId || !descripcion || manoDeObra <= 0) {
    return res.status(422).json({ ok: false, error: 'Completá la descripción técnica y el monto de mano de obra.' });
  }

  const sol = serviceRequestsStore.find((s) => s.id === solicitudId);
  if (!sol) {
    return res.status(404).json({ ok: false, error: 'Solicitud no encontrada.' });
  }

  const now = new Date();
  const vencimiento = new Date(now.getTime() + validezDias * 24 * 60 * 60 * 1000);
  const codigoPresupuesto = `PRES-${now.getFullYear()}-${String(getNextPresupuestoId()).padStart(3, '0')}`;

  const nuevoPresupuesto: PresupuestoFormal = {
    id: getNextPresupuestoId(),
    codigo: codigoPresupuesto,
    solicitud_id: sol.id,
    orden_codigo: sol.codigo || `FIX-${sol.id}`,
    profesional_id: user.id,
    profesional_nombre: `${user.nombre} ${user.apellido}`,
    profesional_matricula: user.matricula || null,
    cuit_prestador: '20-' + (Math.floor(10000000 + Math.random() * 90000000)) + '-3',
    cliente_email: sol.email,
    cliente_nombre: `${sol.nombre} ${sol.apellido}`,
    descripcion_trabajo: descripcion,
    mano_de_obra: manoDeObra,
    materiales: materiales >= 0 ? materiales : 0,
    total: manoDeObra + (materiales >= 0 ? materiales : 0),
    validez_dias: validezDias,
    plazo_ejecucion_dias: plazoEjecucion,
    fecha_emision: now.toISOString(),
    fecha_vencimiento: vencimiento.toISOString(),
    estado: 'pendiente',
  };

  presupuestosStore.unshift(nuevoPresupuesto);
  sol.estado = 'contactado';

  return res.json({
    ok: true,
    mensaje: `Presupuesto ${codigoPresupuesto} emitido con validez legal de ${validezDias} días corridos.`,
    presupuesto: nuevoPresupuesto,
  });
});

// Aceptación / Rechazo de Presupuesto Previo por parte del Cliente
app.post('/api/presupuesto/responder', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const body = req.body || {};
  const presupuestoId = parseInt(String(body.presupuesto_id || '0'), 10);
  const accion = String(body.accion || '').toLowerCase(); // 'aceptar' | 'rechazar'

  const presupuesto = presupuestosStore.find((p) => p.id === presupuestoId);
  if (!presupuesto) {
    return res.status(404).json({ ok: false, error: 'Presupuesto no encontrado.' });
  }

  if (accion === 'aceptar') {
    presupuesto.estado = 'aceptado';
    presupuesto.fecha_respuesta = new Date().toISOString();
    const sol = serviceRequestsStore.find((s) => s.id === presupuesto.solicitud_id);
    if (sol) {
      sol.estado = 'en_proceso';
    }
    return res.json({
      ok: true,
      mensaje: `Presupuesto ${presupuesto.codigo} aceptado. Se inició la orden formal de trabajo y rige la garantía legal de 90 días.`,
      estado: 'aceptado',
    });
  } else if (accion === 'rechazar') {
    presupuesto.estado = 'rechazado';
    presupuesto.fecha_respuesta = new Date().toISOString();
    return res.json({
      ok: true,
      mensaje: `Presupuesto ${presupuesto.codigo} declinado por el usuario.`,
      estado: 'rechazado',
    });
  }

  return res.status(422).json({ ok: false, error: 'Acción no válida.' });
});

// Botón de Arrepentimiento (Art. 34 Ley 24.240 y Res. 424/2020)
app.post('/api/arrepentimiento', (req: Request, res: Response) => {
  const body = req.body || {};
  const codigoOrden = String(body.codigo_orden || '').trim().toUpperCase();
  const email = String(body.email || '').trim().toLowerCase();
  const telefono = String(body.telefono || '').trim();
  const motivo = String(body.motivo || 'Revocación voluntaria según Art. 34 Ley 24.240').trim();

  if (!codigoOrden || !email) {
    return res.status(422).json({ ok: false, error: 'Ingresá el número de orden y tu email registrado.' });
  }

  const solicitud = serviceRequestsStore.find(
    (s) => (s.codigo && s.codigo.toUpperCase() === codigoOrden) || ('FIX-' + s.id) === codigoOrden
  );

  const now = new Date();
  const idArrepentimiento = getNextArrepentimientoId();
  const codigoTramite = `ARR-${now.getFullYear()}-${String(1000 + idArrepentimiento)}`;

  // Verificar plazo de 10 días corridos si la solicitud existe
  if (solicitud) {
    const fechaCreacion = new Date(solicitud.creado_en);
    const diasTranscurridos = (now.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24);
    if (diasTranscurridos > 10) {
      return res.status(400).json({
        ok: false,
        error: 'El plazo legal de arrepentimiento de 10 días corridos (Art. 34 Ley 24.240) ha expirado para esta orden.',
      });
    }

    solicitud.estado = 'cancelado';
  }

  const nuevoArrepentimiento: SolicitudArrepentimiento = {
    id: idArrepentimiento,
    codigo_tramite: codigoTramite,
    solicitud_id: solicitud ? solicitud.id : 0,
    orden_codigo: codigoOrden,
    email,
    telefono: telefono || (solicitud ? solicitud.telefono : ''),
    motivo,
    fecha_solicitud: now.toISOString(),
    estado: 'recibido_en_termino',
    monto_reintegro: '100% de fondos retenidos en custodia Mercado Pago',
  };

  arrepentimientosStore.unshift(nuevoArrepentimiento);

  return res.json({
    ok: true,
    codigo: codigoTramite,
    mensaje: `Revocación asentada exitosamente bajo Resolución 424/2020. Constancia de trámite: ${codigoTramite}. Reintegro de fondos activado sin deducciones.`,
  });
});

// Botón de Baja de Suscripción (Art. 10 ter Ley 24.240 y Res. 271/2020)
app.post('/api/baja_suscripcion', (req: Request, res: Response) => {
  const user = getCurrentUser(req);
  const body = req.body || {};
  const email = String(body.email || (user ? user.email : '')).trim().toLowerCase();
  const motivo = String(body.motivo || 'Baja solicitada por el usuario (Res. 271/2020)').trim();

  if (!email) {
    return res.status(422).json({ ok: false, error: 'Ingresá el email de tu cuenta.' });
  }

  const targetUser = usersStore.find((u) => u.email.toLowerCase() === email) || user;
  if (!targetUser) {
    return res.status(404).json({ ok: false, error: 'No se encontró una cuenta con ese email.' });
  }

  const idBaja = getNextBajaId();
  const now = new Date();
  const codigoBaja = `BAJA-${now.getFullYear()}-${String(2000 + idBaja)}`;

  // Actualizar el plan de forma inmediata sin trabas
  targetUser.plan_pro = 'gratis';
  targetUser.destacado = false;

  const nuevaBaja: SolicitudBajaSuscripcion = {
    id: idBaja,
    codigo_baja: codigoBaja,
    usuario_id: targetUser.id,
    email: targetUser.email,
    plan: 'Plan Profesional / Suscripción',
    motivo,
    fecha_solicitud: now.toISOString(),
    estado: 'baja_inmediata_confirmada',
  };

  bajasSuscripcionStore.unshift(nuevaBaja);

  return res.json({
    ok: true,
    codigo: codigoBaja,
    mensaje: `Baja confirmada de forma inmediata según Art. 10 ter Ley 24.240 y Res. 271/2020. Constancia de trámite: ${codigoBaja}.`,
  });
});

// Fallback 404 handler for HTML pages
app.use((req: Request, res: Response) => {
  const notFoundPath = path.join(__dirname, '404.html');
  if (fs.existsSync(notFoundPath)) {
    res.status(404).sendFile(notFoundPath);
  } else {
    res.status(404).send('Página no encontrada');
  }
});

// Start Server
app.listen(PORT, HOST, () => {
  console.log(`FIXYA server is running on http://${HOST}:${PORT}`);
});
