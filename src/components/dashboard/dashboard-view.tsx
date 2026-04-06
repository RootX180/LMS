import { useQuery } from '@tanstack/react-query';
import { DollarSign, Percent, Chrome as Home, PhoneIncoming as HomeIcon } from 'lucide-react';
import { MetricCard } from './metric-card';
import { RevenueChart } from './revenue-chart';
import { RoomStatusChart } from './room-status-chart';
import { RoomGrid } from './room-grid';
import { analyticsService } from '@/services/analytics.service';
import { roomsService } from '@/services/rooms.service';

export function DashboardView() {
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: analyticsService.getDashboardMetrics,
  });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenue-chart'],
    queryFn: () => analyticsService.getRevenueChart(7),
  });

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: ['room-status-distribution'],
    queryFn: analyticsService.getRoomStatusDistribution,
  });

  const { data: rooms, isLoading: roomsLoading } = useQuery({
    queryKey: ['rooms'],
    queryFn: roomsService.getAll,
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics?.totalRevenue.toFixed(2) || 0}`}
          icon={DollarSign}
          subtitle="All-time earnings"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Occupancy Rate"
          value={`${metrics?.occupancyRate || 0}%`}
          icon={Percent}
          subtitle={`${metrics?.roomsOccupied || 0} of ${metrics?.totalRooms || 0} rooms occupied`}
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Rooms Occupied"
          value={metrics?.roomsOccupied || 0}
          icon={Home}
          subtitle="Currently in use"
          isLoading={metricsLoading}
        />
        <MetricCard
          title="Rooms Available"
          value={metrics?.roomsRemaining || 0}
          icon={HomeIcon}
          subtitle="Ready for booking"
          isLoading={metricsLoading}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <RevenueChart data={revenueData || []} isLoading={revenueLoading} />
        <RoomStatusChart data={statusData || []} isLoading={statusLoading} />
      </div>

      <RoomGrid rooms={rooms || []} isLoading={roomsLoading} />
    </div>
  );
}
