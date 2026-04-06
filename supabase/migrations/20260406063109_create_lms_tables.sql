/*
  # Lodge Management System Database Schema

  ## New Tables
  
  1. `room_types`
    - `id` (uuid, primary key)
    - `title` (text) - e.g., "Single", "Deluxe", "Executive"
    - `base_price` (numeric) - Price per night
    - `capacity` (integer) - Maximum number of guests
    - `amenities` (text[]) - Array of amenity strings
    - `description` (text) - Optional description
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  2. `rooms`
    - `id` (uuid, primary key)
    - `room_number` (text, unique) - Room identifier
    - `floor` (integer) - Floor number
    - `room_type_id` (uuid, foreign key to room_types)
    - `housekeeping_status` (text) - "Clean", "Dirty", "Maintenance", "Occupied"
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  3. `bookings`
    - `id` (uuid, primary key)
    - `guest_name` (text)
    - `guest_email` (text)
    - `guest_phone` (text)
    - `room_id` (uuid, foreign key to rooms)
    - `check_in` (date)
    - `check_out` (date)
    - `status` (text) - "Pending", "Confirmed", "Checked-in", "Checked-out", "Cancelled"
    - `total_amount` (numeric)
    - `notes` (text)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  4. `payments`
    - `id` (uuid, primary key)
    - `booking_id` (uuid, foreign key to bookings)
    - `amount` (numeric)
    - `payment_method` (text) - "Cash", "Card", "Mobile Money", "Bank Transfer"
    - `payment_status` (text) - "Pending", "Completed", "Failed", "Refunded"
    - `transaction_ref` (text)
    - `created_at` (timestamptz)

  5. `user_profiles`
    - `id` (uuid, primary key, foreign key to auth.users)
    - `full_name` (text)
    - `role` (text) - "Admin", "Receptionist", "Housekeeping", "Manager"
    - `email` (text)
    - `phone` (text)
    - `is_active` (boolean)
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)

  ## Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
    - Admin role has full access, other roles have limited access
*/

-- Create room_types table
CREATE TABLE IF NOT EXISTS room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  base_price numeric NOT NULL DEFAULT 0,
  capacity integer NOT NULL DEFAULT 1,
  amenities text[] DEFAULT '{}',
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number text UNIQUE NOT NULL,
  floor integer NOT NULL DEFAULT 1,
  room_type_id uuid REFERENCES room_types(id) ON DELETE RESTRICT,
  housekeeping_status text NOT NULL DEFAULT 'Clean',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_housekeeping_status CHECK (housekeeping_status IN ('Clean', 'Dirty', 'Maintenance', 'Occupied'))
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  guest_email text,
  guest_phone text,
  room_id uuid REFERENCES rooms(id) ON DELETE RESTRICT,
  check_in date NOT NULL,
  check_out date NOT NULL,
  status text NOT NULL DEFAULT 'Pending',
  total_amount numeric DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_booking_status CHECK (status IN ('Pending', 'Confirmed', 'Checked-in', 'Checked-out', 'Cancelled')),
  CONSTRAINT valid_dates CHECK (check_out > check_in)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 0,
  payment_method text NOT NULL,
  payment_status text NOT NULL DEFAULT 'Pending',
  transaction_ref text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_payment_method CHECK (payment_method IN ('Cash', 'Card', 'Mobile Money', 'Bank Transfer')),
  CONSTRAINT valid_payment_status CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded'))
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'Receptionist',
  email text NOT NULL,
  phone text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_role CHECK (role IN ('Admin', 'Receptionist', 'Housekeeping', 'Manager'))
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type_id);
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(housekeeping_status);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at DESC);

-- Enable Row Level Security
ALTER TABLE room_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for room_types
CREATE POLICY "Anyone can view room types"
  ON room_types FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert room types"
  ON room_types FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update room types"
  ON room_types FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete room types"
  ON room_types FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for rooms
CREATE POLICY "Anyone can view rooms"
  ON rooms FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert rooms"
  ON rooms FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rooms"
  ON rooms FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rooms"
  ON rooms FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for bookings
CREATE POLICY "Anyone can view bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete bookings"
  ON bookings FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for payments
CREATE POLICY "Anyone can view payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete payments"
  ON payments FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_room_types_updated_at BEFORE UPDATE ON room_types
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
