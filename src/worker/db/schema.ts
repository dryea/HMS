export interface Hotel {
  id: string; name: string; address: string;
  contact_person: string; contact_phone: string;
  created_at: string; updated_at: string;
}
export interface Event {
  id: string; hotel_id?: string; name: string;
  description?: string; start_date: string; end_date: string;
  event_code: string; is_active: number; created_at: string;
}
export interface EventHotel {
  id: string; event_id: string; hotel_id: string;
  code?: string; created_at: string;
}
export interface RoomType {
  id: string; event_id: string; name: string;
  capacity: number; created_at: string;
}
export interface Room {
  id: string; event_id: string; room_type_id?: string;
  room_number: string; floor?: string; hotel_id?: string;
  wing?: string; status: string; created_at: string;
}
export interface Bed {
  id: string; room_id: string; label: string;
  bed_type: string; is_occupied: number; created_at: string;
}
export interface Participant {
  id: string; event_id: string; bed_id?: string; hotel_id?: string;
  ein?: string; name: string; phone?: string;
  email?: string; company?: string; department?: string;
  qr_token?: string; qr_r2_key?: string;
  status: string; version: number; created_at: string;
}
export interface Checkin {
  id: string; participant_id: string; event_id: string; hotel_id?: string;
  status: string; checked_by?: string;
  checked_at?: string; notes?: string; created_at: string;
}
