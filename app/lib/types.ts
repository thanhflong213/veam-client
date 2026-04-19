export interface Page {
  _id: string;
  slug: string;
  title: string;
  contentHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  contentHtml: string;
  coverImage?: string;
  status: 'draft' | 'published';
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface HeroSlide {
  type: string;
  badge?: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  businessHours?: string;
}

export interface Settings {
  _id?: string;
  siteName: string;
  activeTheme: 'modern' | 'classic';
  heroSlides: HeroSlide[];
  socialLinks?: SocialLinks;
  contactInfo?: ContactInfo;
}
