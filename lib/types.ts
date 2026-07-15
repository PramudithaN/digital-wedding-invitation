export interface Category {
  id: string;
  name: string;
  colour: string;
  created_at?: string;
}

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  side?: 'bride' | 'groom';
  category_id?: string;
  invite_token: string;
  notes?: string;
  created_at?: string;
}

export interface RSVP {
  id: string;
  guest_id: string;
  status: 'attending' | 'declined' | 'pending';
  plus_one: boolean;
  plus_one_name?: string;
  meal_choice?: string;
  dietary_notes?: string;
  message?: string;
  alcohol_choice?: string;
  responded_at?: string;
}

export interface InviteLink {
  id: string;
  guest_id: string;
  short_code: string;
  channel: string;
  sent_at?: string;
  opened_at?: string;
}

export interface GuestWithDetails extends Guest {
  category?: Category | null;
  rsvp?: RSVP | null;
  invite_link?: InviteLink | null;
}
