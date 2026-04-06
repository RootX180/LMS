import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  room_types: {
    id: string;
    title: string;
    base_price: number;
    capacity: number;
    amenities: string[];
    description: string | null;
    created_at: string;
    updated_at: string;
  };
  rooms: {
    id: string;
    room_number: string;
    floor: number;
    room_type_id: string;
    housekeeping_status: 'Clean' | 'Dirty' | 'Maintenance' | 'Occupied';
    created_at: string;
    updated_at: string;
  };
  bookings: {
    id: string;
    guest_name: string;
    guest_email: string | null;
    guest_phone: string | null;
    room_id: string;
    check_in: string;
    check_out: string;
    status: 'Pending' | 'Confirmed' | 'Checked-in' | 'Checked-out' | 'Cancelled';
    total_amount: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
  };
  payments: {
    id: string;
    booking_id: string;
    amount: number;
    payment_method: 'Cash' | 'Card' | 'Mobile Money' | 'Bank Transfer';
    payment_status: 'Pending' | 'Completed' | 'Failed' | 'Refunded';
    transaction_ref: string | null;
    created_at: string;
  };
  user_profiles: {
    id: string;
    full_name: string;
    role: 'Admin' | 'Receptionist' | 'Housekeeping' | 'Manager';
    email: string;
    phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  };
};

export type RoomType = Database['room_types'];
export type Room = Database['rooms'];
export type Booking = Database['bookings'];
export type Payment = Database['payments'];
export type UserProfile = Database['user_profiles'];
