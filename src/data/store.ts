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
  creado_en: string;
}

export interface ContactMessage {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  interes: string | null;
  mensaje: string;
  ip: string | null;
  creado_en: string;
}

export interface ServiceRequest {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  servicio: string;
  descripcion: string | null;
  estado: 'pendiente' | 'contactado' | 'cerrado';
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
    bio: 'Administrador de plataforma FIXYA.',
    foto: null,
    es_admin: 1,
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
    bio: 'Plomero matriculado con más de 14 años de experiencia en instalaciones termofusión, detección de fugas no destructiva y reparación de cañerías en viviendas e industrias.',
    foto: '/assets/corporativas/corp-06-plomeria.webp',
    es_admin: 0,
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
    bio: 'Técnico electromecánico certificado. Montaje de tableros, recableado completo, certificados de seguridad eléctrica y automatización para comercios.',
    foto: '/assets/corporativas/corp-07-electricista.webp',
    es_admin: 0,
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
    bio: 'Especialista en climatización frío/calor, sistemas inverter, desinfección de evaporadoras y recarga de refrigerante ecológico R410A / R32.',
    foto: '/assets/corporativas/corp-08-aire.webp',
    es_admin: 0,
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
    bio: 'Pintor profesional con equipo airless. Pintura látex interior, impermeabilización de terrazas, esmaltes y restauración de carpintería y herrería.',
    foto: '/assets/corporativas/corp-18-pintura.webp',
    es_admin: 0,
    creado_en: '2025-02-01T11:20:00.000Z',
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
    creado_en: '2025-02-18T18:40:00.000Z',
  },
];

export const serviceRequestsStore: ServiceRequest[] = [
  {
    id: 1,
    nombre: 'Mariana',
    apellido: 'López',
    email: 'mariana.lopez@ejemplo.com',
    telefono: '+54 387 400-5566',
    servicio: 'plomeria',
    descripcion: 'Filtración en cañería de baño en primer piso, gotea hacia el cielorraso del piso inferior.',
    estado: 'pendiente',
    ip: '127.0.0.1',
    creado_en: '2025-02-20T10:05:00.000Z',
  },
  {
    id: 2,
    nombre: 'Gonzalo',
    apellido: 'Navarro',
    email: 'g.navarro@ejemplo.com',
    telefono: '+54 387 611-7788',
    servicio: 'electricidad',
    descripcion: 'Cambio de disyuntor diferencial y revisión de puesta a tierra.',
    estado: 'contactado',
    ip: '127.0.0.1',
    creado_en: '2025-02-19T11:30:00.000Z',
  },
];

let nextUserId = 10;
let nextContactId = 10;
let nextServiceId = 10;

export function getNextUserId(): number {
  return nextUserId++;
}

export function getNextContactId(): number {
  return nextContactId++;
}

export function getNextServiceId(): number {
  return nextServiceId++;
}
