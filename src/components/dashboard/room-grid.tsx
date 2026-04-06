import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Room } from '@/lib/supabase';

interface RoomGridProps {
  rooms: Room[];
  isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  Clean: 'bg-green-500 hover:bg-green-600',
  Dirty: 'bg-yellow-500 hover:bg-yellow-600',
  Maintenance: 'bg-red-500 hover:bg-red-600',
  Occupied: 'bg-blue-500 hover:bg-blue-600',
};

export function RoomGrid({ rooms, isLoading }: RoomGridProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Room Status Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Room Status Overview</CardTitle>
        <div className="flex flex-wrap gap-4 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-green-500" />
            <span className="text-muted-foreground">Clean</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-yellow-500" />
            <span className="text-muted-foreground">Dirty</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-red-500" />
            <span className="text-muted-foreground">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-blue-500" />
            <span className="text-muted-foreground">Occupied</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
          {rooms.map((room) => (
            <button
              key={room.id}
              className={cn(
                'h-12 rounded-md text-white text-xs font-medium transition-colors flex items-center justify-center',
                STATUS_COLORS[room.housekeeping_status]
              )}
              title={`Room ${room.room_number} - ${room.housekeeping_status}`}
            >
              {room.room_number}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
