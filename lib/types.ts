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
  side?: 'bride' | 'groom' | 'groom_mother' | 'groom_father';
  category_id?: string;
  relationship?: 'relative' | 'friend';
  invite_token: string;
  notes?: string;
  table_no?: string;
  created_at?: string;
}

export interface RSVP {
  id: string;
  guest_id: string;
  status: 'attending' | 'declined' | 'pending';
  plus_one: number;
  plus_one_name?: string;
  meal_choice?: string;
  dietary_notes?: string;
  message?: string;
  alcohol_choice?: string;
  responded_at?: string;
  attending_count?: number;
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

export interface GalleryImage {
  id: string;
  url: string;
  position?: number;
  created_at?: string;
}
