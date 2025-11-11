// web/lib/types.ts

// This interface matches our SQLModel 'Listing'
export interface Listing {
  id: number;
  name: string;
  image_url: string | null;
}

// This interface matches our SQLModel 'ReviewCategoryRating'
export interface ReviewCategoryRating {
  id: number;
  category: string;
  rating: number;
  review_id: number;
}

// This interface matches our main SQLModel 'Review'
export interface Review {
  id: number;
  hostaway_id: number;
  guest_name: string;
  review_text: string;
  channel: string;
  submitted_at: string; // The API will send dates as strings
  overall_rating: number;
  is_approved: boolean;
  listing_id: number;
  category_ratings: ReviewCategoryRating[];
  listing?: Listing;
}

// This will be the type for our shared filter state
export interface DashboardFilters {
  listingId: number | 'all';
  minRating: number | 'all';
  channel: string | 'all';
}