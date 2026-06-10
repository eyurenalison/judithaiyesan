export type SiteSettings = {
  siteName: string;
  logoSrc: string;
  faviconSrc: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  facebookUrl?: string;
  instagramUrl?: string;
};

export type HeroSlide = {
  title: string;
  subtitle?: string;
  imageSrc: string;
  buttonLabel?: string;
  buttonUrl?: string;
  order: number;
  published: boolean;
};

export type Album = {
  title: string;
  subtitle: string;
  coverSrc: string;
  listenHref: string;
  downloadHref?: string;
  audioSrc?: string;
  featured: boolean;
  order: number;
  published: boolean;
};

export type Lyric = {
  title: string;
  body: string;
  summary: string;
  coverSrc?: string;
  published: boolean;
};

export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type EventItem = {
  title: string;
  status: "Upcoming" | "Past";
  date: string;
  location: string;
  description: string;
  imageSrc: string;
  gallery?: GalleryImage[];
  published: boolean;
};

export type ContactMessageInput = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};
