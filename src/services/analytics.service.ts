import { supabase } from '@/lib/supabase';

export interface DashboardMetrics {
  totalRevenue: number;
  occupancyRate: number;
  roomsOccupied: number;
  roomsRemaining: number;
  totalRooms: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface RoomStatusCount {
  status: string;
  count: number;
}

export const analyticsService = {
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const [roomsResult, bookingsResult, paymentsResult] = await Promise.all([
      supabase.from('rooms').select('housekeeping_status'),
      supabase
        .from('bookings')
        .select('status')
        .in('status', ['Confirmed', 'Checked-in']),
      supabase
        .from('payments')
        .select('amount, payment_status')
        .eq('payment_status', 'Completed'),
    ]);

    if (roomsResult.error) throw roomsResult.error;
    if (bookingsResult.error) throw bookingsResult.error;
    if (paymentsResult.error) throw paymentsResult.error;

    const totalRooms = roomsResult.data?.length || 0;
    const roomsOccupied = roomsResult.data?.filter(
      r => r.housekeeping_status === 'Occupied'
    ).length || 0;
    const roomsRemaining = totalRooms - roomsOccupied;
    const occupancyRate = totalRooms > 0 ? (roomsOccupied / totalRooms) * 100 : 0;
    const totalRevenue = paymentsResult.data?.reduce(
      (sum, p) => sum + Number(p.amount),
      0
    ) || 0;

    return {
      totalRevenue,
      occupancyRate: Math.round(occupancyRate),
      roomsOccupied,
      roomsRemaining,
      totalRooms,
    };
  },

  async getRevenueChart(days: number = 7): Promise<RevenueDataPoint[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('payments')
      .select('amount, created_at, payment_status')
      .eq('payment_status', 'Completed')
      .gte('created_at', startDate.toISOString());

    if (error) throw error;

    const revenueMap = new Map<string, number>();

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      revenueMap.set(dateStr, 0);
    }

    data?.forEach(payment => {
      const dateStr = payment.created_at.split('T')[0];
      const current = revenueMap.get(dateStr) || 0;
      revenueMap.set(dateStr, current + Number(payment.amount));
    });

    return Array.from(revenueMap.entries())
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  async getRoomStatusDistribution(): Promise<RoomStatusCount[]> {
    const { data, error } = await supabase
      .from('rooms')
      .select('housekeeping_status');

    if (error) throw error;

    const statusMap = new Map<string, number>();

    data?.forEach(room => {
      const count = statusMap.get(room.housekeeping_status) || 0;
      statusMap.set(room.housekeeping_status, count + 1);
    });

    return Array.from(statusMap.entries()).map(([status, count]) => ({
      status,
      count,
    }));
  },

  async searchGlobal(query: string) {
    const searchTerm = `%${query}%`;

    const [bookingsResult, roomsResult] = await Promise.all([
      supabase
        .from('bookings')
        .select('id, guest_name, guest_email, status, room:rooms(room_number)')
        .or(`guest_name.ilike.${searchTerm},guest_email.ilike.${searchTerm}`)
        .limit(5),
      supabase
        .from('rooms')
        .select('id, room_number, room_type:room_types(title)')
        .ilike('room_number', searchTerm)
        .limit(5),
    ]);

    return {
      bookings: bookingsResult.data || [],
      rooms: roomsResult.data || [],
    };
  },
};
