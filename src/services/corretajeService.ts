import { supabase } from './supabase';
import type { CorretajeLead, ExternalProperty, BrokerInfo } from '../data/corretajeData';
import { MOCK_LEADS, MOCK_PROPERTIES, MOCK_BROKERS } from '../data/corretajeData';

const ORG_ID = 'e67404e2-d14c-44ad-9275-9b89372aa57d'; // Creastilo Inmobiliaria Org ID

// In-memory store for manual entries when DB is offline
let localLeads: CorretajeLead[] = [];
let localProperties: ExternalProperty[] = [];
let localBrokers: BrokerInfo[] = [];
let isUsingMock = false;

export const fetchDashboardData = async () => {
  try {
    // 1. Fetch Leads + Requests
    const { data: requestData, error: reqError } = await supabase
      .from('corretaje_requests')
      .select('*, leads!inner(full_name, whatsapp, created_at)')
      .eq('org_id', ORG_ID)
      .order('created_at', { ascending: false, foreignTable: 'leads' });

    // 2. Fetch Brokers
    const { data: brokerData, error: brokerError } = await supabase
      .from('corretaje_brokers')
      .select('*')
      .eq('org_id', ORG_ID);

    // 3. Fetch Properties
    const { data: propData, error: propError } = await supabase
      .from('corretaje_properties')
      .select('*, corretaje_brokers(name, phone, is_aisin, shares_commission)')
      .eq('org_id', ORG_ID)
      .order('created_at', { ascending: false });

    const hasErrors = reqError || brokerError || propError;
    const hasData = (requestData?.length || 0) + (brokerData?.length || 0) + (propData?.length || 0) > 0;

    // 🔁 FALLBACK: if DB offline or empty, use rich mock data
    if (hasErrors || !hasData) {
      // Supabase unavailable — using demo data
      isUsingMock = true;

      // Merge mock with any locally-added entries
      return {
        leads: [...MOCK_LEADS, ...localLeads],
        brokers: [...MOCK_BROKERS, ...localBrokers],
        properties: [...MOCK_PROPERTIES, ...localProperties],
        isMock: true,
      };
    }

    isUsingMock = false;

    const leads: CorretajeLead[] = (requestData || []).map((req: any) => ({
      id: req.id,
      client: req.leads.full_name,
      operationType: req.operation_type,
      propertyType: req.property_type,
      budget: req.budget_display || '$0',
      budgetValue: Number(req.budget_max) || 0,
      sector: req.sector || 'Sin sector',
      paymentMethod: req.payment_method,
      details: req.details || '',
      status: req.status,
      category: req.category,
      receivedAt: new Date(req.leads.created_at),
      optionsFound: req.options_found,
      optionsTarget: req.options_target,
      whatsappMessage: req.whatsapp_broadcast || '',
      assignedTo: req.assigned_to || 'Sin asignar',
    }));

    const brokers: BrokerInfo[] = (brokerData || []).map((b: any) => ({
      id: b.id,
      name: b.name,
      phone: b.phone,
      email: b.email,
      isAISIN: b.is_aisin,
      sharesCommission: b.shares_commission,
      company: b.company,
      status: b.status,
      totalProperties: b.total_properties,
      lastContactedAt: b.last_contacted_at ? new Date(b.last_contacted_at) : undefined,
      notes: b.notes,
    }));

    const properties: ExternalProperty[] = (propData || []).map((p: any) => ({
      id: p.id,
      source: p.source,
      propertyType: p.property_type,
      operationType: p.operation_type,
      price: p.price >= 1_000_000
        ? `$${(p.price / 1_000_000).toFixed(1)}M`
        : `$${(p.price / 1000).toFixed(0)}K`,
      priceValue: p.price,
      sector: p.sector,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      broker: {
        id: p.broker_id,
        name: p.corretaje_brokers?.name || 'Vendedor Directo',
        phone: p.corretaje_brokers?.phone || 'Ver en Portal',
        isAISIN: p.corretaje_brokers?.is_aisin || false,
        sharesCommission: p.corretaje_brokers?.shares_commission || false,
        status: 'pending',
        totalProperties: 1,
      },
      status: p.status,
      notes: p.notes,
      externalLink: p.external_link,
      imageUrl: p.image_url,
      isGem: p.is_gem,
      marketDeviation: p.market_deviation
    }));

    return { leads, brokers, properties, isMock: false };
  } catch (error) {
    // Data fetch error — fallback to mock
    isUsingMock = true;
    return {
      leads: [...MOCK_LEADS, ...localLeads],
      brokers: [...MOCK_BROKERS, ...localBrokers],
      properties: [...MOCK_PROPERTIES, ...localProperties],
      isMock: true,
    };
  }
};

export const getIsUsingMock = () => isUsingMock;

export const createManualLead = async (leadData: any): Promise<boolean> => {
  // If using mock mode, add to local store
  if (isUsingMock) {
    const newLead: CorretajeLead = {
      id: `LOCAL-${Date.now()}`,
      client: leadData.clientName || 'Cliente Nuevo',
      operationType: leadData.operationType || 'Compra',
      propertyType: leadData.propertyType || 'Casa',
      budget: leadData.budgetDisplay || '$0',
      budgetValue: Number(leadData.budgetMax) || 0,
      sector: leadData.sector || 'Sin sector',
      paymentMethod: leadData.paymentMethod,
      details: leadData.details || '',
      status: 'new',
      category: (leadData.category as any) || 'B',
      receivedAt: new Date(),
      optionsFound: 0,
      optionsTarget: 3,
      whatsappMessage: `Buen dia compañeros\n-Solicito ${leadData.propertyType} ${leadData.operationType}\n-Ppto ${leadData.budgetDisplay}\n-Sector ${leadData.sector}\n\nEnviar opciones por privado\n¡Muchas gracias!\nAtia Inmobiliaria`,
    };
    localLeads = [newLead, ...localLeads];
    return true;
  }

  // Live DB mode
  try {
    const { data: lead, error: leadError } = await supabase.from('leads').insert({
      org_id: ORG_ID,
      full_name: leadData.clientName,
      whatsapp: leadData.phone || 'Sin número',
      status: 'new',
      vertical: 'inmobiliaria',
      source: 'manual_dashboard',
    }).select().single();

    if (leadError) throw leadError;

    const { error: requestError } = await supabase.from('corretaje_requests').insert({
      org_id: ORG_ID,
      lead_id: lead.id,
      operation_type: leadData.operationType,
      property_type: leadData.propertyType,
      budget_display: leadData.budgetDisplay || 'No espec.',
      budget_max: Number(leadData.budgetMax) || null,
      sector: leadData.sector,
      details: leadData.details || '',
      category: leadData.category || 'B',
      status: 'new',
      options_target: 3,
      options_found: 0,
    });

    if (requestError) throw requestError;
    return true;
  } catch (err) {
    // createManualLead error
    return false;
  }
};

export const createManualProperty = async (propData: any): Promise<boolean> => {
  // If using mock mode, add to local store
  if (isUsingMock) {
    const defaultBroker: BrokerInfo = {
      id: `BRK-LOCAL-${Date.now()}`,
      name: propData.brokerName || 'Propietario Directo',
      phone: propData.brokerPhone || '667-000-0000',
      isAISIN: false,
      sharesCommission: null,
      status: 'pending',
      totalProperties: 1,
    };
    const priceVal = Number(propData.priceValue) || 0;
    const newProp: ExternalProperty = {
      id: `LOCAL-P-${Date.now()}`,
      source: (propData.source as any) || 'WhatsApp',
      propertyType: propData.propertyType || 'Casa',
      operationType: propData.operationType || 'Venta',
      price: priceVal >= 1_000_000
        ? `$${(priceVal / 1_000_000).toFixed(1)}M`
        : `$${(priceVal / 1000).toFixed(0)}K`,
      priceValue: priceVal,
      sector: propData.sector || 'Sin sector',
      bedrooms: propData.bedrooms ? Number(propData.bedrooms) : undefined,
      bathrooms: propData.bathrooms ? Number(propData.bathrooms) : undefined,
      broker: defaultBroker,
      commission: propData.commission || undefined,
      status: 'found',
      notes: propData.notes || '',
    };
    localProperties = [newProp, ...localProperties];
    return true;
  }

  // Live DB mode
  try {
    const { error } = await supabase.from('corretaje_properties').insert({
      org_id: ORG_ID,
      source: propData.source,
      property_type: propData.propertyType,
      operation_type: propData.operationType,
      price: Number(propData.priceValue) || 0,
      sector: propData.sector,
      bedrooms: propData.bedrooms ? Number(propData.bedrooms) : null,
      bathrooms: propData.bathrooms ? Number(propData.bathrooms) : null,
      notes: propData.notes || '',
      status: 'available',
    });

    if (error) throw error;
    return true;
  } catch (err) {
    // createManualProperty error
    return false;
  }
};

export const createManualBroker = async (brokerData: any): Promise<boolean> => {
  if (isUsingMock) {
    const newBroker: BrokerInfo = {
      id: `LOCAL-BRK-${Date.now()}`,
      name: brokerData.name,
      phone: brokerData.phone,
      isAISIN: brokerData.isAISIN,
      sharesCommission: brokerData.sharesCommission,
      company: brokerData.company || 'Independiente',
      status: brokerData.isAISIN ? 'aisin_verified' : 'pending',
      totalProperties: 0,
    };
    localBrokers = [newBroker, ...localBrokers];
    return true;
  }

  try {
    const { error } = await supabase.from('corretaje_brokers').insert({
      org_id: ORG_ID,
      name: brokerData.name,
      phone: brokerData.phone,
      is_aisin: brokerData.isAISIN,
      shares_commission: brokerData.sharesCommission,
      company: brokerData.company || 'Independiente',
      status: brokerData.isAISIN ? 'aisin_verified' : 'pending',
      total_properties: 0
    });
    if (error) throw error;
    return true;
  } catch (err) {
    // createManualBroker error
    return false;
  }
};
