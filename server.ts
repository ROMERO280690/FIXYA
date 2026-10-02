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
  getNextUserId,
  getNextContactId,
  getNextServiceId,
  User,
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
const PORT = parseInt(process.env.PORT || '3000', 10);
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
app.use(express.static(__dirname));

// Helper: current user
function getCurrentUser(req: Request): User | null {
  if (!req.session.userId) return null;
  return usersStore.find((u) => u.id === req.session.userId) || null;
}

// Fixed CSRF token for forms
const CSRF_TOKEN = 'fixya-csrf-valid-token-2025';

// ----------------- Dynamic Pages -----------------

// Profesionales listing
app.get(['/profesionales', '/profesionales.php'], (req: Request, res: Response) => {
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

  res.render('profesionales', {
    profesionales: list,
    servicioFiltro,
    zonaFiltro,
  });
});

// Profesional single detail
app.get(['/profesional', '/profesional.php'], (req: Request, res: Response) => {
  const id = parseInt(String(req.query.id || '0'), 10);
  const p = usersStore.find((u) => u.id === id && u.tipo_usuario === 'profesional') || null;

  if (!p) {
    res.status(404);
  }

  res.render('profesional', { p });
});

// Producto (category details)
app.get(['/producto', '/producto.php'], (req: Request, res: Response) => {
  let slug = typeof req.query.s === 'string' ? req.query.s.toLowerCase() : 'plomeria';
  if (!catalogoCategorias[slug]) {
    res.status(404);
    slug = 'plomeria';
  }
  const cat = catalogoCategorias[slug];
  res.render('producto', { cat, slug });
});

// Perfil (logged-in user)
app.get(['/perfil', '/perfil.php'], (req: Request, res: Response) => {
  const usuario = getCurrentUser(req);
  if (!usuario) {
    return res.redirect('/login.html');
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
        if (!usuario) return res.redirect('/login.html');
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
      return res.redirect('/login.html');
    }

    const especialidad = String(req.body['especialidad'] || '').trim();
    const zona = String(req.body['zona'] || '').trim();
    const precioBase = String(req.body['precio-base'] || '').trim();
    const bio = String(req.body['bio'] || '').trim();

    usuario.especialidad = especialidad || null;
    usuario.zona = zona || null;
    usuario.precio_base = precioBase || null;
    usuario.bio = bio || null;

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
app.get(['/dashboard', '/dashboard.php'], (req: Request, res: Response) => {
  const usuario = getCurrentUser(req);
  if (!usuario) {
    return res.redirect('/login.html');
  }

  const nombreCompleto = usuario.nombre + ' ' + usuario.apellido;
  const solicitudesAsignadas = serviceRequestsStore.slice(0, 5);

  res.render('dashboard', {
    usuario,
    nombreCompleto,
    solicitudesAsignadas,
  });
});

// Admin portal
app.get(['/admin', '/admin.php'], (req: Request, res: Response) => {
  const admin = getCurrentUser(req);
  if (!admin) {
    return res.redirect('/login.html');
  }
  if (!admin.es_admin) {
    return res.status(403).send('No autorizado. Se requieren permisos de administrador.');
  }

  const profesionales = usersStore.filter((u) => u.tipo_usuario === 'profesional');
  const totalClientes = usersStore.filter((u) => u.tipo_usuario === 'cliente').length;
  const pendientes = serviceRequestsStore.filter((s) => s.estado === 'pendiente').length;

  res.render('admin', {
    admin,
    solicitudes: serviceRequestsStore,
    mensajes: contactMessagesStore,
    profesionales,
    totalClientes,
    pendientes,
    estadoLabel: {
      pendiente: 'Pendiente',
      contactado: 'Contactado',
      cerrado: 'Cerrado',
    },
    csrfToken: CSRF_TOKEN,
  });
});

// ----------------- API Endpoints -----------------

// CSRF token endpoint
app.get(['/api/csrf', '/api/csrf.php'], (_req: Request, res: Response) => {
  res.json({ ok: true, token: CSRF_TOKEN });
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
  const redirectTarget = user.es_admin ? 'admin.php' : 'perfil.php';
  return res.json({ ok: true, redirect: redirectTarget });
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
    especialidad: null,
    zona: null,
    precio_base: null,
    bio: null,
    foto: null,
    es_admin: 0,
    creado_en: new Date().toISOString(),
  };

  usersStore.unshift(newUser);
  req.session.userId = newUser.id;

  return res.json({ ok: true, redirect: 'perfil.php' });
});

// Logout endpoint
app.get(['/api/logout', '/api/logout.php'], (req: Request, res: Response) => {
  req.session.destroy(() => {
    res.redirect('/login.html');
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
  const descripcion = String(body.descripcion || '').trim();

  const errores: string[] = [];
  if (!nombre) errores.push('El nombre es obligatorio.');
  if (!apellido) errores.push('El apellido es obligatorio.');
  if (!email || !email.includes('@')) errores.push('El email no es válido.');
  if (!telefono) errores.push('El teléfono es obligatorio.');
  if (!servicio) errores.push('Elegí un servicio.');

  if (errores.length > 0) {
    return res.status(422).json({ ok: false, error: errores.join(' ') });
  }

  const reqItem = {
    id: getNextServiceId(),
    nombre,
    apellido,
    email,
    telefono,
    servicio,
    descripcion: descripcion || null,
    estado: 'pendiente' as const,
    ip: req.ip || null,
    creado_en: new Date().toISOString(),
  };

  serviceRequestsStore.unshift(reqItem);

  return res.json({
    ok: true,
    mensaje: 'Contratación confirmada. Te contactaremos para coordinar el servicio.',
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

  if (!['pendiente', 'contactado', 'cerrado'].includes(estado)) {
    return res.status(422).json({ ok: false, error: 'Estado inválido.' });
  }

  const item = serviceRequestsStore.find((s) => s.id === id);
  if (item) {
    item.estado = estado as 'pendiente' | 'contactado' | 'cerrado';
  }

  return res.json({ ok: true });
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
