import { supabase, type Room } from '@/lib/supabase';

export interface RoomWithType extends Room {
  room_type?: {
    id: string;
    title: string;
    base_price: number;
  };
}

export const roomsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_type:room_types(id, title, base_price)
      `)
      .order('room_number', { ascending: true });

    if (error) throw error;
    return data as RoomWithType[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_type:room_types(id, title, base_price, capacity, amenities)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as RoomWithType | null;
  },

  async getAvailableRooms(checkIn: string, checkOut: string) {
    const { data: bookedRoomIds, error: bookingError } = await supabase
      .from('bookings')
      .select('room_id')
      .in('status', ['Confirmed', 'Checked-in'])
      .or(`and(check_in.lte.${checkOut},check_out.gte.${checkIn})`);

    if (bookingError) throw bookingError;

    const bookedIds = bookedRoomIds?.map(b => b.room_id) || [];

    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_type:room_types(id, title, base_price)
      `)
      .not('id', 'in', `(${bookedIds.join(',') || 'null'})`)
      .order('room_number', { ascending: true });

    if (error) throw error;
    return data as RoomWithType[];
  },

  async create(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()
      .single();

    if (error) throw error;
    return data as Room;
  },

  async update(id: string, room: Partial<Omit<Room, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('rooms')
      .update(room)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Room;
  },

  async updateHousekeepingStatus(id: string, status: Room['housekeeping_status']) {
    const { data, error } = await supabase
      .from('rooms')
      .update({ housekeeping_status: status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Room;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
