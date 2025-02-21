import { supabase } from '../lib/supabase';

export const routesService = {
  async saveRoute(routeData) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('routes')
      .insert([{
        ...routeData,
        user_id: user.id,
        created_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return data;
  },

  async getRoutes() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async getRoute(id) {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateRoute(id, updates) {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('routes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select();
    
    if (error) throw error;
    return data;
  }
};