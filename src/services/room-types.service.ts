import { supabase, type RoomType } from '@/lib/supabase';

export const roomTypesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as RoomType[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('room_types')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as RoomType | null;
  },

  async create(roomType: Omit<RoomType, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('room_types')
      .insert(roomType)
      .select()
      .single();

    if (error) throw error;
    return data as RoomType;
  },

  async update(id: string, roomType: Partial<Omit<RoomType, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('room_types')
      .update(roomType)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as RoomType;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('room_types')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
