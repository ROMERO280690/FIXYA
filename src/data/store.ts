import bcrypt from 'bcryptjs';

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  tipo_usuario: 'cliente' | 'profesional';
  especialidad: string | null;
  zona: string | null;
  precio_base: string | null;
  bio: string | null;
  foto: string | null;
  es_admin: number;
  verificado: boolean;
  telefono?: string | null;
  matricula?: string | null;
  plan_pro?: 'gratis' | 'pro' | 'empresa';
  destacado?: boolean;
  creado_en: string;
}

export interface Review {
  id: number;
  profesional_id: number;
  cliente_nombre: string;
  estrellas: number;
  comentario: string;
  servicio: string;
  zona: string;
  fecha: string;
}

export interface ContactMessage {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  interes: string | null;
  mensaje: string;
  ip: string | null;
  leido?: boolean;
  creado_en: string;
}

export interface ServiceRequest {
  id: number;
  codigo?: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  servicio: string;
  urgencia?: string;
  zona?: string;
  profesional_id?: number | null;
  descripcion: string | null;
  metodo_pago?: string;
  estado: 'pendiente' | 'contactado' | 'en_proceso' | 'cerrado' | 'cancelado';
  monto_estimado?: string | null;
  ip: string | null;
  creado_en: string;
}

const defaultPasswordHash = bcrypt.hashSync('admin1234', 10);
const proPasswordHash = bcrypt.hashSync('fixya2025', 10);

export const usersStore: User[] = [
  {
    id: 1,
    nombre: 'Admin',
    apellido: 'FIXYA',
    email: 'admin@fixya.io',
    password_hash: defaultPasswordHash,
    tipo_usuario: 'cliente',
    especialidad: null,
    zona: 'Salta, Argentina',
    precio_base: null,
    bio: 'Administrador central de operaciones y auditoría FIXYA.',
    foto: null,
    es_admin: 1,
    verificado: true,
    telefono: '+54 9 387 352-2920',
    matricula: 'ADM-001-FIX',
    creado_en: '2025-01-01T10:00:00.000Z',
  },
  {
    id: 2,
    nombre: 'Carlos',
    apellido: 'Romero',
    email: 'carlos.plomero@fixya.io',
    password_hash: proPasswordHash,
    tipo_usuario: 'profesional',
    especialidad: 'Plomería y Gas',
    zona: 'Salta Capital',
    precio_base: '$25.000 / visita técnica',
    bio: 'Plomero matriculado con más de 14 años de experiencia en instalaciones de termofusión, detección de fugas no destructiva y reparación de cañerías en viviendas e industrias.',
    foto: '/assets/corporativas/corp-06-plomeria.webp',
    es_admin: 0,
    verificado: true,
    plan_pro: 'pro',
    destacado: true,
    telefono: '+54 9 387 455-1122',
    matricula: 'MAT-GAS-4921',
    creado_en: '2025-01-10T14:30:00.000Z',
  },
  {
    id: 3,
    nombre: 'Martín',
    apellido: 'Gómez',
    email: 'martin.electricista@fixya.io',
    password_hash: proPasswordHash,
    tipo_usuario: 'profesional',
    especialidad: 'Electricidad e Iluminación',
    zona: 'Salta y alrededores',
    precio_base: '$30.000 / diagnóstico',
    bio: 'Técnico electromecánico certificado. Montaje de tableros trifásicos, recableado reglamentario, certificados de seguridad eléctrica DGR y automatización de portones y bombas.',
    foto: '/assets/corporativas/corp-07-electricista.webp',
    es_admin: 0,
    verificado: true,
    plan_pro: 'empresa',
    destacado: true,
    telefono: '+54 9 387 422-3344',
    matricula: 'COPEL-9812',
    creado_en: '2025-01-12T09:15:00.000Z',
  },
  {
    id: 4,
    nombre: 'Laura',
    apellido: 'Vargas',
    email: 'laura.clima@fixya.io',
    password_hash: proPasswordHash,
    tipo_usuario: 'profesional',
    especialidad: 'Aire acondicionado y Climatización',
    zona: 'Salta Centro y Tres Cerritos',
    precio_base: '$35.000 / instalación básica',
    bio: 'Especialista en climatización frío/calor, sistemas inverter residenciales y comerciales, desinfección de evaporadoras y recarga de refrigerante ecológico R410A / R32.',
    foto: '/assets/corporativas/corp-08-aire.webp',
    es_admin: 0,
    verificado: true,
    plan_pro: 'pro',
    destacado: true,
    telefono: '+54 9 387 511-6677',
    matricula: 'AHR-3410',
    creado_en: '2025-01-18T16:00:00.000Z',
  },
  {
    id: 5,
    nombre: 'Jorge',
    apellido: 'Fernández',
    email: 'jorge.pintura@fixya.io',
    password_hash: proPasswordHash,
    tipo_usuario: 'profesional',
    especialidad: 'Pintura y Terminaciones',
    zona: 'San Lorenzo y Salta Capital',
    precio_base: 'A cotizar según m²',
    bio: 'Pintor profesional con equipamiento airless de alta presión. Pintura látex lavable interior, impermeabilización de terrazas y techos, esmaltes y restauración de molduras.',
    foto: '/assets/corporativas/corp-18-pintura.webp',
    es_admin: 0,
    verificado: true,
    telefono: '+54 9 387 499-8800',
    matricula: 'REG-SALTA-1204',
    creado_en: '2025-02-01T11:20:00.000Z',
  },
  {
    id: 6,
    nombre: 'Esteban',
    apellido: 'Benítez',
    email: 'esteban.herrero@fixya.io',
    password_hash: proPasswordHash,
    tipo_usuario: 'profesional',
    especialidad: 'Herrería y Estructuras',
    zona: 'Salta Capital y Valle de Lerma',
    precio_base: '$28.000 / presupuesto en obra',
    bio: 'Herrero de oficio. Rejas de seguridad para ventanas y frentes, portones corredizos y levadizos, techos de chapa y policarbonato, soldaduras TIG/MIG de precisión.',
    foto: '/assets/corporativas/corp-03-taller.webp',
    es_admin: 0,
    verificado: true,
    telefono: '+54 9 387 566-2211',
    matricula: 'OFI-SALTA-873',
    creado_en: '2025-02-05T10:00:00.000Z',
  },
  {
    id: 7,
    nombre: 'Rodrigo',
    apellido: 'Paredes',
    email: 'rodrigo.cerrajero@fixya.io',
    password_hash: proPasswordHash,
    tipo_usuario: 'profesional',
    especialidad: 'Cerrajería 24 Horas',
    zona: 'Salta Capital - Urgencias 24hs',
    precio_base: '$20.000 / apertura de urgencia',
    bio: 'Cerrajería integral domiciliaria y automotor. Aperturas no destructivas 24 hs, cambio de combinación, cerraduras blindadas Trabex/Kallay y cerrojos de alta seguridad.',
    foto: '/assets/corporativas/corp-16-oficina-noche.webp',
    es_admin: 0,
    verificado: true,
    telefono: '+54 9 387 352-2920',
    matricula: 'CER-ARG-5542',
    creado_en: '2025-02-08T18:00:00.000Z',
  },
  {
    id: 8,
    nombre: 'Pablo',
    apellido: 'Sarmiento',
    email: 'pablo.jardineria@fixya.io',
    password_hash: proPasswordHash,
    tipo_usuario: 'profesional',
    especialidad: 'Jardinería y Parques',
    zona: 'San Lorenzo, Tres Cerritos y Grand Bourg',
    precio_base: '$22.000 / mantenimiento',
    bio: 'Mantenimiento de espacios verdes residenciales y countries. Corte de césped profesional, poda de altura con motoguadañas Stihl, desmalezado y diseño de canteros.',
    foto: '/assets/corporativas/corp-13-topografia.webp',
    es_admin: 0,
    verificado: true,
    telefono: '+54 9 387 488-3322',
    matricula: 'ESP-VERDE-901',
    creado_en: '2025-02-12T08:30:00.000Z',
  },
  {
    id: 9,
    nombre: 'Facundo',
    apellido: 'Morales',
    email: 'facundo.redes@fixya.io',
    password_hash: proPasswordHash,
    tipo_usuario: 'profesional',
    especialidad: 'Informática, Cámaras y Redes',
    zona: 'Salta y Gran Salta',
    precio_base: '$25.000 / diagnóstico en sitio',
    bio: 'Técnico superior en redes y telecomunicaciones. Instalación de cámaras de seguridad CCTV / Wi-Fi, cableado estructurado, configuración de routers y soporte técnico a pymes.',
    foto: '/assets/corporativas/corp-05-cliente-tecnico.webp',
    es_admin: 0,
    verificado: true,
    telefono: '+54 9 387 533-4455',
    matricula: 'TIC-SALTA-208',
    creado_en: '2025-02-14T12:00:00.000Z',
  },
];

export const reviewsStore: Review[] = [
  {
    id: 1,
    profesional_id: 2,
    cliente_nombre: 'Ignacio M.',
    estrellas: 5,
    comentario: 'Excelente atención y puntualidad. Solucionó una pérdida en el baño que otros dos plomeros no habían podido resolver. Todo quedó limpio y el costo fue exactamente el acordado.',
    servicio: 'Plomería y Gas',
    zona: 'Salta Capital',
    fecha: '2025-02-18',
  },
  {
    id: 2,
    profesional_id: 2,
    cliente_nombre: 'Clara P.',
    estrellas: 5,
    comentario: 'Muy profesional y prolijo. Me explicó todo antes de intervenir y me mostró las piezas cambiadas. El pago con Mercado Pago a través de FIXYA me dio total tranquilidad.',
    servicio: 'Termofusión',
    zona: 'San Lorenzo',
    fecha: '2025-02-10',
  },
  {
    id: 3,
    profesional_id: 3,
    cliente_nombre: 'Mariana S.',
    estrellas: 5,
    comentario: 'Revisó el tablero completo que saltaba con las lluvias. Cambió el disyuntor y equilibró las fases. Excelente técnico electromecánico.',
    servicio: 'Electricidad',
    zona: 'Tres Cerritos',
    fecha: '2025-02-22',
  },
  {
    id: 4,
    profesional_id: 4,
    cliente_nombre: 'Gonzalo R.',
    estrellas: 5,
    comentario: 'Instaló dos splits inverter en una sola mañana. Hizo vacío a las cañerías con bomba profesional y dejó todo impecable.',
    servicio: 'Aire acondicionado',
    zona: 'Grand Bourg',
    fecha: '2025-02-15',
  },
  {
    id: 5,
    profesional_id: 5,
    cliente_nombre: 'Silvia T.',
    estrellas: 5,
    comentario: 'Pintó todo el living y el pasillo. Muy respetuoso y meticuloso cubriendo pisos y muebles con nylon. Super recomendable.',
    servicio: 'Pintura',
    zona: 'Salta Centro',
    fecha: '2025-02-20',
  },
  {
    id: 6,
    profesional_id: 6,
    cliente_nombre: 'Héctor B.',
    estrellas: 5,
    comentario: 'Hizo un portón corredizo a medida para el garaje con excelente terminación y soldaduras muy limpias.',
    servicio: 'Herrería',
    zona: 'Cerrillos',
    fecha: '2025-02-12',
  },
  {
    id: 7,
    profesional_id: 7,
    cliente_nombre: 'Valeria G.',
    estrellas: 5,
    comentario: 'Me quedé afuera a las 23 hs un domingo y llegó en 20 minutos. Abrió sin romper la puerta ni el marco. Gran alivio.',
    servicio: 'Cerrajería 24 hs',
    zona: 'Salta Centro',
    fecha: '2025-02-24',
  },
];

export const contactMessagesStore: ContactMessage[] = [
  {
    id: 1,
    nombre: 'Esteban Morales',
    email: 'esteban@ejemplo.com',
    telefono: '+54 387 411-2233',
    interes: 'Electricidad',
    mensaje: 'Necesito revisar el tablero general de mi negocio porque salta la térmica principal al encender las máquinas.',
    ip: '127.0.0.1',
    leido: false,
    creado_en: '2025-02-15T15:20:00.000Z',
  },
  {
    id: 2,
    nombre: 'Valeria Soria',
    email: 'valeria.s@ejemplo.com',
    telefono: '+54 387 522-3344',
    interes: 'Aire acondicionado',
    mensaje: 'Consulta para instalación de dos equipos split de 3000 frigorías en departamento nuevo.',
    ip: '127.0.0.1',
    leido: true,
    creado_en: '2025-02-18T18:40:00.000Z',
  },
  {
    id: 3,
    nombre: 'Arq. Marcos Toledo',
    email: 'mtoledo@estudio.com',
    telefono: '+54 387 499-1100',
    interes: 'Soy profesional y quiero sumarme',
    mensaje: 'Tenemos un equipo de contratistas para reformas integrales y queremos publicar nuestros servicios en FIXYA.',
    ip: '127.0.0.1',
    leido: false,
    creado_en: '2025-02-23T11:15:00.000Z',
  },
];

export const serviceRequestsStore: ServiceRequest[] = [
  {
    id: 1,
    codigo: 'FIX-10492',
    nombre: 'Mariana',
    apellido: 'López',
    email: 'mariana.lopez@ejemplo.com',
    telefono: '+54 387 400-5566',
    servicio: 'plomeria',
    urgencia: '24hs',
    zona: 'Salta Capital - Tres Cerritos',
    profesional_id: 2,
    descripcion: 'Filtración en cañería de baño en primer piso, gotea hacia el cielorraso del piso inferior.',
    metodo_pago: 'mercadopago',
    estado: 'pendiente',
    monto_estimado: '$25.000 – $40.000',
    ip: '127.0.0.1',
    creado_en: '2025-02-20T10:05:00.000Z',
  },
  {
    id: 2,
    codigo: 'FIX-20814',
    nombre: 'Gonzalo',
    apellido: 'Navarro',
    email: 'g.navarro@ejemplo.com',
    telefono: '+54 387 611-7788',
    servicio: 'electricidad',
    urgencia: 'urgencia',
    zona: 'Salta Capital - Centro',
    profesional_id: 3,
    descripcion: 'Cambio de disyuntor diferencial que no acciona el test y revisión de puesta a tierra reglamentaria.',
    metodo_pago: 'tarjeta',
    estado: 'contactado',
    monto_estimado: '$30.000 – $55.000',
    ip: '127.0.0.1',
    creado_en: '2025-02-19T11:30:00.000Z',
  },
  {
    id: 3,
    codigo: 'FIX-31952',
    nombre: 'Romina',
    apellido: 'Castillo',
    email: 'romina.castillo@ejemplo.com',
    telefono: '+54 387 466-9911',
    servicio: 'aire',
    urgencia: 'programado',
    zona: 'San Lorenzo',
    profesional_id: 4,
    descripcion: 'Mantenimiento de temporada y recambio de gas para equipo de 4500 frigorías frío/calor.',
    metodo_pago: 'transferencia',
    estado: 'en_proceso',
    monto_estimado: '$35.000 – $50.000',
    ip: '127.0.0.1',
    creado_en: '2025-02-21T14:15:00.000Z',
  },
];

let nextUserId = 20;
let nextContactId = 20;
let nextServiceId = 20;
let nextReviewId = 20;

export function getNextUserId(): number {
  return nextUserId++;
}

export function getNextContactId(): number {
  return nextContactId++;
}

export function getNextServiceId(): number {
  return nextServiceId++;
}

export function getNextReviewId(): number {
  return nextReviewId++;
}

export interface PresupuestoFormal {
  id: number;
  codigo: string;
  solicitud_id: number;
  orden_codigo: string;
  profesional_id: number;
  profesional_nombre: string;
  profesional_matricula?: string | null;
  cuit_prestador: string;
  cliente_email: string;
  cliente_nombre: string;
  descripcion_trabajo: string;
  mano_de_obra: number;
  materiales: number;
  total: number;
  validez_dias: number; // Mínimo legal 10 días corridos (Art. 21 Ley 24.240)
  plazo_ejecucion_dias: number;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: 'pendiente' | 'aceptado' | 'rechazado' | 'vencido';
  fecha_respuesta?: string | null;
}

export interface SolicitudArrepentimiento {
  id: number;
  codigo_tramite: string;
  solicitud_id: number;
  orden_codigo: string;
  email: string;
  telefono: string;
  motivo: string;
  fecha_solicitud: string;
  estado: 'recibido_en_termino' | 'reintegro_procesado';
  monto_reintegro?: string;
}

export interface SolicitudBajaSuscripcion {
  id: number;
  codigo_baja: string;
  usuario_id: number;
  email: string;
  plan: string;
  motivo: string;
  fecha_solicitud: string;
  estado: 'baja_inmediata_confirmada';
}

export interface GarantiaCertificado {
  codigo_garantia: string;
  solicitud_id: number;
  orden_codigo: string;
  cliente_nombre: string;
  profesional_nombre: string;
  profesional_matricula?: string | null;
  servicio: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  duracion_dias: number; // Mínimo legal 90 días para reparaciones y servicios (Arts. 11 a 17 Ley 24.240)
  cobertura: string;
  estado: 'vigente' | 'vencida' | 'en_reclamo';
}

export const presupuestosStore: PresupuestoFormal[] = [
  {
    id: 1,
    codigo: 'PRES-2025-001',
    solicitud_id: 1,
    orden_codigo: 'FIX-10492',
    profesional_id: 2,
    profesional_nombre: 'Carlos Romero',
    profesional_matricula: 'MAT-GAS-4921 (ENARGAS / Gasnor)',
    cuit_prestador: '20-31849201-4',
    cliente_email: 'mariana.lopez@ejemplo.com',
    cliente_nombre: 'Mariana López',
    descripcion_trabajo: 'Detección no destructiva de fuga en tramo de termofusión de baño principal, reemplazo de niple fisurado y prueba hidráulica estanca bajo presión reglamentaria.',
    mano_de_obra: 28000,
    materiales: 9500,
    total: 37500,
    validez_dias: 15, // Superior al mínimo legal de 10 días de la Ley 24.240
    plazo_ejecucion_dias: 1,
    fecha_emision: '2025-02-20T11:00:00.000Z',
    fecha_vencimiento: '2025-03-07T11:00:00.000Z',
    estado: 'pendiente',
  },
  {
    id: 2,
    codigo: 'PRES-2025-002',
    solicitud_id: 2,
    orden_codigo: 'FIX-20814',
    profesional_id: 3,
    profesional_nombre: 'Martín Gómez',
    profesional_matricula: 'COPEL-9812 (Consejo Profesional / Ley Seg. Eléctrica)',
    cuit_prestador: '20-29401823-3',
    cliente_email: 'g.navarro@ejemplo.com',
    cliente_nombre: 'Gonzalo Navarro',
    descripcion_trabajo: 'Instalación de interruptor diferencial tetrapolar 40A 30mA marca Schneider reglamentario, normalización de peines de conexión y medición de jabalina a tierra con telurímetro.',
    mano_de_obra: 32000,
    materiales: 18500,
    total: 50500,
    validez_dias: 10,
    plazo_ejecucion_dias: 1,
    fecha_emision: '2025-02-19T14:00:00.000Z',
    fecha_vencimiento: '2025-03-01T14:00:00.000Z',
    estado: 'aceptado',
    fecha_respuesta: '2025-02-19T16:30:00.000Z',
  },
];

export const arrepentimientosStore: SolicitudArrepentimiento[] = [];
export const bajasSuscripcionStore: SolicitudBajaSuscripcion[] = [];

let nextPresupuestoId = 10;
let nextArrepentimientoId = 10;
let nextBajaId = 10;

export function getNextPresupuestoId(): number {
  return nextPresupuestoId++;
}

export function getNextArrepentimientoId(): number {
  return nextArrepentimientoId++;
}

export function getNextBajaId(): number {
  return nextBajaId++;
}

export function getReviewsForProfessional(proId: number): Review[] {
  return reviewsStore.filter((r) => r.profesional_id === proId);
}

export function getProRating(proId: number): { average: number; count: number } {
  const list = getReviewsForProfessional(proId);
  if (list.length === 0) return { average: 0, count: 0 };
  const sum = list.reduce((acc, curr) => acc + curr.estrellas, 0);
  return {
    average: Math.round((sum / list.length) * 10) / 10,
    count: list.length,
  };
}
