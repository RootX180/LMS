import { supabase, type Payment } from '@/lib/supabase';

export interface PaymentWithDetails extends Payment {
  booking?: {
    id: string;
    guest_name: string;
    room: {
      room_number: string;
    };
  };
}

export const paymentsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(
          id,
          guest_name,
          room:rooms(room_number)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as PaymentWithDetails[];
  },

  async getById(id: string) {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        booking:bookings(
          id,
          guest_name,
          guest_email,
          room:rooms(room_number)
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data as PaymentWithDetails | null;
  },

  async create(payment: Omit<Payment, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async update(id: string, payment: Partial<Omit<Payment, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Payment;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
