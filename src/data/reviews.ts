import reviewsData from './reviews-db.json';

export interface Review {
  id: string;
  author: string;
  source: 'Google' | 'Facebook';
  stars: number;
  text: string;
  date: string;       // ISO string
  relativeDate?: string; // e.g. "5 days ago" - formatted by script or computed
  link: string;
  verified: boolean;
  avatarUrl?: string;
  title?: string;     // keeping for backward compatibility if needed, though new JSON lacks it
}

// Cast the JSON data to the interface
export const reviews: Review[] = reviewsData as Review[];
