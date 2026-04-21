export interface Page {
  _id: string;
  slug: string;
  title: string;
  contentHtml: string;
  seoTitle?: string;
  seoDescription?: string;
  status: 'draft' | 'published';
  parent?: string | null;
  disabled?: boolean;
  children?: Page[];
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
  recommend?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Institution {
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

export interface NavItem {
  label: string;
  href?: string;
  enabled: boolean;
  children?: NavItem[];
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
  navItems?: NavItem[];
  featuredAnnouncements?: string[];
  socialLinks?: SocialLinks;
  contactInfo?: ContactInfo;
}
