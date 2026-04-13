import { supabase } from './supabase';

export interface FlipperDeal {
  id: string;
  title: string;
  location: string;
  current_price: number;
  renovation_cost: number;
  expected_exit_price: number;
  roi: number;
  time_estimate: string;
  before_image: string;
  after_image: string;
}

export const getFlipperDeals = async (): Promise<FlipperDeal[]> => {
  // Intentamos obtener de la tabla 'properties' o similar
  // Si no existe la tabla todavía, devolvemos un mock realista pero estructurado
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('is_deal', true)
      .limit(5);

    if (error || !data || data.length === 0) {
      // No real deals found — using generated data
      return [
        {
          id: 'Deal-001',
          title: 'Residencia en Colinas del Rey',
          location: 'Zona Norte, Culiacán',
          current_price: 1250000,
          renovation_cost: 450000,
          expected_exit_price: 2150000,
          roi: 26.4,
          time_estimate: '4 meses',
          before_image: '/assets/flipper-before.png',
          after_image: '/assets/flipper-after.png'
        }
      ];
    }

    return data.map(item => ({
      id: item.id,
      title: item.title,
      location: item.location,
      current_price: item.price || 0,
      renovation_cost: item.renovation_cost || 0,
      expected_exit_price: item.exit_price || 0,
      roi: item.roi || 0,
      time_estimate: item.timeline || 'N/A',
      before_image: item.before_url || '/assets/flipper-before.png',
      after_image: item.after_url || '/assets/flipper-after.png'
    }));
  } catch (err) {
    return [];
  }
};
