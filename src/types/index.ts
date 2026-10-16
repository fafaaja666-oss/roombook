export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

export type ReservationStatus = 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak' | 'Dibatalkan';

export interface Reservation {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  eventName: string;
  roomId: string;
  roomName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  participants: number;
  purpose: string;
  notes?: string;
  status: ReservationStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomFacility {
  name: string;
  icon?: string;
}

export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  facilities: string[];
  description: string;
  image: string;
  isMaintenance: boolean;
  status: 'Tersedia' | 'Pemeliharaan';
}