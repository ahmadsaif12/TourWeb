export type UserSummary = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  city: string;
  is_host: boolean;
  avatar_url: string;
};

export type User = UserSummary & {
  email: string;
  avatar: string | null;
  bio: string;
  phone: string;
  wishlist_ids: number[];
};

export type ListingAddon = {
  name: string;
  price: number;
};

export type Listing = {
  id: number;
  slug: string;
  owner: UserSummary;
  title: string;
  description: string;
  category: string;
  price: string;
  cleaning_fee: string;
  service_fee: string;
  base_guests: number;
  max_guests: number;
  max_kids: number;
  max_infants: number;
  max_pets: number;
  extra_guest_fee_per_night: string;
  addons: ListingAddon[];
  country: string;
  location: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
  average_rating: number;
  review_count: number;
  is_wishlisted: boolean;
  created_at: string;
  updated_at: string;
};

export type Booking = {
  id: number;
  listing: number;
  listing_detail: Listing;
  guest: UserSummary;
  check_in: string;
  check_out: string;
  guests: number;
  total_price: string;
  status: string;
  payment_status: string;
  special_requests: string;
  nights: number;
  created_at: string;
  updated_at: string;
};

export type Review = {
  id: number;
  listing: number;
  listing_detail: Listing;
  author: UserSummary;
  booking: number | null;
  rating: number;
  comment: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: number;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
};

export type Category = {
  value: string;
  label: string;
};

export type AuthPayload = {
  access: string;
  refresh: string;
  user: User;
};
