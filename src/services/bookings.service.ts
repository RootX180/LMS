import { supabase, type Booking } from '@/lib/supabase';

export interface BookingWithDetails extends Booking {
  room?: {
    id: string;
    room_number: string;
    room_type: {
      title: string;
    };
  };
}

export const bookingsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(
          id,
          room_number,
          room_type:room_types(title)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as BookingWithDetails[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        room:rooms(
          id,
          room_number,
          room_type:room_types(title, base_price)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as BookingWithDetails | null;
  },

  async create(booking: Omit<Booking, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async update(id: string, booking: Partial<Omit<Booking, 'id' | 'created_at' | 'updated_at'>>) {
    const { data, error } = await supabase
      .from('bookings')
      .update(booking)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Booking;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getRevenueByDateRange(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('bookings')
      .select('total_amount, check_in')
      .gte('check_in', startDate)
      .lte('check_in', endDate)
      .in('status', ['Confirmed', 'Checked-in', 'Checked-out']);

    if (error) throw error;
    return data;
  },
};
