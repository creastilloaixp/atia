// ============================================
// Corretaje Data Layer — Based on GUIA CORRETAJE.pdf
// Models the exact workflow from Atia Inmobiliaria
// ============================================

export type Platform = 'WhatsApp' | 'Wiggot' | 'Lamudi' | 'Tokko' | 'Facebook' | 'Propiedades.com' | 'Gemas';
export type LeadCategory = 'A' | 'B' | 'C';
export type LeadStatus = 'new' | 'searching' | 'options_found' | 'contacted' | 'registered' | 'closed';
export type BrokerStatus = 'pending' | 'shares_commission' | 'no_commission' | 'aisin_verified';
export type OperationType = 'Compra' | 'Venta' | 'Renta';
export type PropertyType = 'Casa' | 'Departamento' | 'Terreno' | 'Local Comercial' | 'Oficina' | 'Bodega';

export interface CorretajeLead {
  id: string;
  client: string;
  avatar?: string;
  operationType: OperationType;
  propertyType: PropertyType;
  budget: string;
  budgetValue: number;
  sector: string;
  paymentMethod?: string;
  details: string;
  status: LeadStatus;
  category: LeadCategory;
  receivedAt: Date;
  optionsFound: number;
  optionsTarget: number; // min 3 per guide
  whatsappMessage: string;
  assignedTo?: string;
}

export interface ExternalProperty {
  id: string;
  source: Platform;
  propertyType: PropertyType;
  operationType: OperationType;
  price: string;
  priceValue: number;
  sector: string;
  bedrooms?: number;
  bathrooms?: number;
  broker: BrokerInfo;
  commission?: string;
  matchesLeadId?: string;
  matchScore?: number; // 0-100
  registeredAt?: Date;
  status: 'found' | 'calling' | 'confirmed' | 'registered' | 'rejected';
  notes?: string;
  externalLink?: string;
  imageUrl?: string;
  isGem?: boolean;
  marketDeviation?: number;
}

export interface BrokerInfo {
  id: string;
  name: string;
  phone: string;
  email?: string;
  isAISIN: boolean;
  sharesCommission: boolean | null; // null = unknown
  company?: string;
  status: BrokerStatus;
  totalProperties: number;
  lastContactedAt?: Date;
  notes?: string;
}

export interface CorretajeKPI {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  sub: string;
  icon: string;
}

// ============================================
// MOCK DATA — Realistic Culiacán properties
// ============================================

export const MOCK_LEADS: CorretajeLead[] = [
  {
    id: 'CRJ-2401',
    client: 'Carlos Rivera M.',
    operationType: 'Compra',
    propertyType: 'Casa',
    budget: '$2.8M',
    budgetValue: 2800000,
    sector: 'Valle Alto, Culiacán',
    paymentMethod: 'Infonavit + Cofinavit',
    details: 'Casa 3 recámaras, 2 baños, estacionamiento doble. Zona norte preferentemente.',
    status: 'searching',
    category: 'A',
    receivedAt: new Date(Date.now() - 1000 * 60 * 8),
    optionsFound: 2,
    optionsTarget: 3,
    whatsappMessage: 'Buen dia compañeros\n-Solicito Casa 3 Rec Compra\n-Ppto $2.8M\n-Sector Valle Alto / Punta Azul\n\nEnviar opciones por privado\n¡Muchas gracias!\nAtia Inmobiliaria',
    assignedTo: 'MaríaL',
  },
  {
    id: 'CRJ-2402',
    client: 'Ana Sofía Guzmán',
    operationType: 'Venta',
    propertyType: 'Casa',
    budget: '$3.5M',
    budgetValue: 3500000,
    sector: 'Chapultepec, Culiacán',
    details: 'Propiedad intestada de abuelos. Requiere saneamiento legal previo.',
    status: 'options_found',
    category: 'B',
    receivedAt: new Date(Date.now() - 1000 * 60 * 45),
    optionsFound: 3,
    optionsTarget: 3,
    whatsappMessage: 'Buen dia compañeros\n-Solicito valuación Casa Intestada\n-Ppto $3.5M estimado\n-Sector Chapultepec\n\nEnviar opciones por privado\n¡Muchas gracias!\nAtia Inmobiliaria',
    assignedTo: 'JorgeR',
  },
  {
    id: 'CRJ-2403',
    client: 'Roberto Mendoza',
    operationType: 'Renta',
    propertyType: 'Departamento',
    budget: '$18K/mes',
    budgetValue: 18000,
    sector: 'Tres Ríos, Culiacán',
    details: 'Departamento amueblado, 2 recámaras para ejecutivo foráneo. Contrato mínimo 6 meses.',
    status: 'new',
    category: 'A',
    receivedAt: new Date(Date.now() - 1000 * 60 * 2),
    optionsFound: 0,
    optionsTarget: 3,
    whatsappMessage: 'Buen dia compañeros\n-Solicito Depto Renta Amueblado\n-Ppto $18K/mes\n-Sector Tres Ríos\n\nEnviar opciones por privado\n¡Muchas gracias!\nAtia Inmobiliaria',
  },
  {
    id: 'CRJ-2404',
    client: 'Patricia Valenzuela',
    operationType: 'Compra',
    propertyType: 'Terreno',
    budget: '$1.2M',
    budgetValue: 1200000,
    sector: 'La Conquista, Culiacán',
    paymentMethod: 'Contado',
    details: 'Terreno residencial 200m² mínimo para construir. Servicios incluidos.',
    status: 'contacted',
    category: 'B',
    receivedAt: new Date(Date.now() - 1000 * 60 * 120),
    optionsFound: 4,
    optionsTarget: 3,
    whatsappMessage: 'Buen dia compañeros\n-Solicito Terreno Residencial Compra\n-Ppto $1.2M\n-Sector La Conquista\n-Pago: Contado\n\nEnviar opciones por privado\n¡Muchas gracias!\nAtia Inmobiliaria',
    assignedTo: 'MaríaL',
  },
  {
    id: 'CRJ-2405',
    client: 'Familia Ochoa',
    operationType: 'Renta',
    propertyType: 'Casa',
    budget: '$25K/mes',
    budgetValue: 25000,
    sector: 'Mazatlán, Sinaloa',
    details: 'Casa 4 rec en zona turística. Preferentemente cerca del malecón.',
    status: 'registered',
    category: 'A',
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 8),
    optionsFound: 5,
    optionsTarget: 3,
    whatsappMessage: 'Buen dia compañeros\n-Solicito Casa Renta 4 Rec\n-Ppto $25K/mes\n-Sector Mazatlán Zona Turística\n\nEnviar opciones por privado\n¡Muchas gracias!\nAtia Inmobiliaria',
    assignedTo: 'JorgeR',
  },
];

export const MOCK_BROKERS: BrokerInfo[] = [
  { id: 'BRK-01', name: 'Juan Pérez', phone: '667-123-4567', email: 'juan@kw.mx', isAISIN: true, sharesCommission: true, company: 'Keller Williams', status: 'aisin_verified', totalProperties: 12, lastContactedAt: new Date(Date.now() - 1000 * 60 * 60 * 2) },
  { id: 'BRK-02', name: 'Laura Sánchez', phone: '667-234-5678', isAISIN: true, sharesCommission: true, company: 'Century 21', status: 'aisin_verified', totalProperties: 8 },
  { id: 'BRK-03', name: 'Miguel Torres', phone: '667-345-6789', isAISIN: false, sharesCommission: false, company: 'Independiente', status: 'no_commission', totalProperties: 3, notes: 'No comparte en general' },
  { id: 'BRK-04', name: 'Diana Flores', phone: '667-456-7890', isAISIN: true, sharesCommission: true, company: 'RE/MAX', status: 'aisin_verified', totalProperties: 15 },
  { id: 'BRK-05', name: 'Inmobiliaria 10', phone: '667-567-8901', isAISIN: false, sharesCommission: null, status: 'pending', totalProperties: 6 },
  { id: 'BRK-06', name: 'Sergio Castillo', phone: '669-123-4567', isAISIN: false, sharesCommission: true, company: 'Independiente Mazatlán', status: 'shares_commission', totalProperties: 4 },
];

export const MOCK_PROPERTIES: ExternalProperty[] = [
  {
    id: 'EXT-101', source: 'Wiggot', propertyType: 'Casa', operationType: 'Compra',
    price: '$2.75M', priceValue: 2750000, sector: 'Valle Alto', bedrooms: 3, bathrooms: 2,
    broker: MOCK_BROKERS[0], commission: '2.5%', matchesLeadId: 'CRJ-2401', matchScore: 92,
    status: 'confirmed',
  },
  {
    id: 'EXT-102', source: 'Lamudi', propertyType: 'Casa', operationType: 'Compra',
    price: '$2.9M', priceValue: 2900000, sector: 'Punta Azul', bedrooms: 3, bathrooms: 2,
    broker: MOCK_BROKERS[1], commission: '3%', matchesLeadId: 'CRJ-2401', matchScore: 85,
    status: 'confirmed',
  },
  {
    id: 'EXT-103', source: 'Facebook', propertyType: 'Departamento', operationType: 'Renta',
    price: '$16K/mes', priceValue: 16000, sector: 'Tres Ríos', bedrooms: 2, bathrooms: 1,
    broker: MOCK_BROKERS[4], matchesLeadId: 'CRJ-2403', matchScore: 78,
    status: 'calling',
  },
  {
    id: 'EXT-104', source: 'Tokko', propertyType: 'Terreno', operationType: 'Compra',
    price: '$1.1M', priceValue: 1100000, sector: 'La Conquista',
    broker: MOCK_BROKERS[3], commission: '2%', matchesLeadId: 'CRJ-2404', matchScore: 95,
    status: 'registered',
  },
  {
    id: 'EXT-105', source: 'Wiggot', propertyType: 'Casa', operationType: 'Renta',
    price: '$22K/mes', priceValue: 22000, sector: 'Zona Dorada, Mazatlán', bedrooms: 4, bathrooms: 3,
    broker: MOCK_BROKERS[5], commission: '1 mes', matchesLeadId: 'CRJ-2405', matchScore: 88,
    status: 'registered',
  },
  {
    id: 'EXT-106', source: 'Lamudi', propertyType: 'Casa', operationType: 'Compra',
    price: '$4.2M', priceValue: 4200000, sector: 'Colinas de San Miguel',
    bedrooms: 4, bathrooms: 3,
    broker: MOCK_BROKERS[2], status: 'rejected', notes: 'Broker no comparte comisión',
  },
  {
    id: 'EXT-107', source: 'WhatsApp', propertyType: 'Casa', operationType: 'Compra',
    price: '$2.6M', priceValue: 2600000, sector: 'Valle Alto', bedrooms: 3, bathrooms: 2,
    broker: MOCK_BROKERS[3], commission: '2.5%', matchesLeadId: 'CRJ-2401', matchScore: 80,
    status: 'found',
  },
];

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getStatusConfig(status: LeadStatus) {
  const map: Record<LeadStatus, { label: string; color: string; bg: string }> = {
    new: { label: 'Nuevo', color: 'text-sky-600', bg: 'bg-sky-50' },
    searching: { label: 'Buscando', color: 'text-amber-600', bg: 'bg-amber-50' },
    options_found: { label: 'Opciones Listas', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    contacted: { label: 'Contactado', color: 'text-indigo-600', bg: 'bg-indigo-50' },
    registered: { label: 'Registrado', color: 'text-emerald-700', bg: 'bg-emerald-100' },
    closed: { label: 'Cerrado', color: 'text-slate-500', bg: 'bg-slate-100' },
  };
  return map[status];
}

export function getPlatformConfig(platform: string) {
  const map: Record<string, { color: string; bg: string; border: string }> = {
    WhatsApp: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    Wiggot: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    Lamudi: { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
    Tokko: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
    Facebook: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    'Propiedades.com': { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    Gemas: { color: 'text-amber-600', bg: 'bg-amber-100', border: 'border-amber-300' },
  };
  return map[platform] || { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' };
}

export function getTimeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export function getSpeedToLeadClass(receivedAt: Date): { color: string; label: string; critical: boolean } {
  const diff = (Date.now() - receivedAt.getTime()) / 1000 / 60;
  if (diff <= 5) return { color: 'text-emerald-500', label: '< 5m ✓', critical: false };
  if (diff <= 15) return { color: 'text-amber-500', label: `${Math.round(diff)}m`, critical: false };
  return { color: 'text-red-500', label: `${Math.round(diff)}m ⚠`, critical: true };
}

export function generateWhatsAppMessage(lead: CorretajeLead): string {
  return `Buen dia compañeros\n-Solicito ${lead.propertyType} ${lead.operationType}\n-Ppto ${lead.budget}\n-Sector ${lead.sector}${lead.paymentMethod ? `\n-Pago: ${lead.paymentMethod}` : ''}\n\nEnviar opciones por privado\n¡Muchas gracias!\nAtia Inmobiliaria`;
}

// KPIs derived from data
export function calculateKPIs(leads: CorretajeLead[], properties: ExternalProperty[], brokers: BrokerInfo[]): CorretajeKPI[] {
  const totalLeads = leads.length;
  const leadsWithOptions = leads.filter(l => l.optionsFound >= l.optionsTarget).length;
  const avgOptions = leads.reduce((s, l) => s + l.optionsFound, 0) / (totalLeads || 1);
  const aisInBrokers = brokers.filter(b => b.isAISIN).length;
  const commissionBrokers = brokers.filter(b => b.sharesCommission === true).length;
  const matchedProperties = properties.filter(p => p.matchesLeadId).length;

  return [
    {
      label: 'Solicitudes Activas',
      value: String(totalLeads),
      trend: '+3',
      trendUp: true,
      sub: 'Pipeline de Corretaje',
      icon: 'inbox',
    },
    {
      label: 'Opciones / Solicitud',
      value: avgOptions.toFixed(1),
      trend: avgOptions >= 3 ? '✓ Meta' : '⚠ Bajo',
      trendUp: avgOptions >= 3,
      sub: 'Target: ≥ 3 por solicitud',
      icon: 'target',
    },
    {
      label: 'Tasa Comisión Compartida',
      value: `${Math.round((commissionBrokers / (brokers.length || 1)) * 100)}%`,
      trend: `${commissionBrokers}/${brokers.length}`,
      trendUp: true,
      sub: 'Asesores que comparten',
      icon: 'handshake',
    },
    {
      label: 'Cobertura AISIN',
      value: `${Math.round((aisInBrokers / (brokers.length || 1)) * 100)}%`,
      trend: `${aisInBrokers} verificados`,
      trendUp: true,
      sub: 'Asesores registrados AISIN',
      icon: 'shield',
    },
    {
      label: 'Propiedades Cruzadas',
      value: String(matchedProperties),
      trend: `de ${properties.length}`,
      trendUp: matchedProperties > 0,
      sub: 'Matches Lead↔Inventario',
      icon: 'zap',
    },
    {
      label: 'Solicitudes Cubiertas',
      value: `${Math.round((leadsWithOptions / (totalLeads || 1)) * 100)}%`,
      trend: `${leadsWithOptions}/${totalLeads}`,
      trendUp: leadsWithOptions === totalLeads,
      sub: '≥3 opciones encontradas',
      icon: 'check',
    },
    {
      label: 'Gemas de Inversión',
      value: String(properties.filter(p => p.isGem).length),
      trend: 'IA Activa',
      trendUp: true,
      sub: 'Oportunidades < Mercado',
      icon: 'zap',
    },
  ];
}
