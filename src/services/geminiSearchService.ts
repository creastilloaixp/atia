import { seedProperties, type Property } from '../data/seedProperties';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export interface SearchResult {
  property: Property;
  match_score: number;
  analysis: string;
  recommendation: string;
  risk_summary: string;
}

export interface SearchResponse {
  query_understanding: {
    intent: string;
    filters_detected: string;
    search_strategy: string;
  };
  results: SearchResult[];
  market_insight: string;
  total_found: number;
}

export async function intelligentSearch(query: string): Promise<SearchResponse> {
  try {
    // Build compact property context to send to backend
    const propertyContext = seedProperties.map(p => ({
      id: p.id, title: p.title, city: p.city, zone: p.zone,
      neighborhood: p.neighborhood, type: p.property_type,
      situation: p.situation, price: p.current_price,
      market_value: p.market_value, reno_cost: p.renovation_cost,
      exit_price: p.expected_exit_price, roi: p.roi,
      discount: p.discount_pct, beds: p.bedrooms, baths: p.bathrooms,
      sqm: p.sqm_construction, terrain: p.sqm_terrain,
      price_sqm: p.price_per_sqm, debt: p.debt_amount,
      legal: p.legal_status, risk: p.risk_level,
      time: p.time_estimate, desc: p.description,
    }));

    const response = await fetch(`${SUPABASE_URL}/functions/v1/gemini-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ query, properties: propertyContext }),
    });

    if (!response.ok) throw new Error(`Search API error: ${response.status}`);

    const { result: parsed } = await response.json();

    // Ensure query_understanding fields are strings
    const stringify = (val: unknown): string =>
      typeof val === 'string' ? val : JSON.stringify(val);
    if (parsed.query_understanding) {
      parsed.query_understanding.intent = stringify(parsed.query_understanding.intent);
      parsed.query_understanding.filters_detected = stringify(parsed.query_understanding.filters_detected);
      parsed.query_understanding.search_strategy = stringify(parsed.query_understanding.search_strategy);
    }

    // Map response back to full property objects
    const results: SearchResult[] = (parsed.matched_ids || []).map((id: string, idx: number) => {
      const property = seedProperties.find(p => p.id === id);
      if (!property) return null;
      return {
        property,
        match_score: parsed.scores?.[idx] ?? 80,
        analysis: parsed.analyses?.[idx] ?? '',
        recommendation: parsed.recommendations?.[idx] ?? '',
        risk_summary: parsed.risk_summaries?.[idx] ?? '',
      };
    }).filter(Boolean) as SearchResult[];

    return {
      query_understanding: parsed.query_understanding || {
        intent: 'Búsqueda general',
        filters_detected: 'Ninguno específico',
        search_strategy: 'Mejores oportunidades disponibles',
      },
      results,
      market_insight: parsed.market_insight || '',
      total_found: results.length,
    };
  } catch (error) {
    // Fallback: return top 3 by ROI
    const fallback = [...seedProperties]
      .sort((a, b) => b.roi - a.roi)
      .slice(0, 3);

    return {
      query_understanding: {
        intent: 'Búsqueda general (fallback)',
        filters_detected: query,
        search_strategy: 'Ordenado por ROI más alto',
      },
      results: fallback.map(p => ({
        property: p,
        match_score: 75,
        analysis: `${p.description.slice(0, 120)}...`,
        recommendation: `Oportunidad con ROI del ${p.roi}% en ${p.city}.`,
        risk_summary: `Riesgo ${p.risk_level}. ${p.legal_status}`,
      })),
      market_insight: 'Mostrando las mejores oportunidades por ROI disponible.',
      total_found: fallback.length,
    };
  }
}
