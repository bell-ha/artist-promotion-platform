// ──────────────────────────────────────────────
// Template 2 : 퍼포머 (Guitarist / Session Artist)
// ──────────────────────────────────────────────

export interface T2NameSection {
  name: string;
  english_name: string;
  description1?: string;
  description2?: string;
  thumbnail_url?: string;
  activity_area?: string;
}

// ── Album Section Cards (Template 2 동일 구조) ─

export interface T2YoutubeCard {
  type: "youtube";
  order: number;
  link: string;
  project_title?: string;
  project_subtitle?: string;
  album_name?: string;
  composer?: string;
  category_desc?: string;
  year?: number;
  description?: string;
}

export interface T2SoundcloudCard {
  type: "soundcloud";
  order: number;
  link: string;
  project_title?: string;
  project_subtitle?: string;
  album_name?: string;
  composer?: string;
  category_desc?: string;
  year?: number;
  description?: string;
}

export interface T2ImageCard {
  type: "image";
  order: number;
  image_url: string;
  hyperlink?: string;
  project_title?: string;
  project_subtitle?: string;
  album_name?: string;
  composer?: string;
  category_desc?: string;
  year?: number;
  description?: string;
}

export interface T2NoImageCard {
  type: "no_image";
  order: number;
  mp3_url?: string;
  project_title?: string;
  project_subtitle?: string;
  album_name?: string;
  composer?: string;
  category_desc?: string;
  year?: number;
  description?: string;
}

export type T2AlbumCard =
  | T2YoutubeCard
  | T2SoundcloudCard
  | T2ImageCard
  | T2NoImageCard;

export interface T2AlbumSection {
  cards: T2AlbumCard[];
}

// ── Text Section ──────────────────────────────

export interface T2TextCardBodyItem {
  order: number;
  title?: string;
  content?: string;
}

export interface T2TextCard {
  order: number;
  title?: string;
  detail?: string;
  body_items: T2TextCardBodyItem[];
}

export interface T2TextSection {
  order: number;
  title?: string;
  description?: string;
  cards: T2TextCard[];
}

// ── Image Section (Template 2 전용) ──────────

export interface T2ImageSectionImage {
  order: number;
  image_url: string;
}

export interface T2ImageSection {
  order: number;
  title?: string;
  description?: string;
  images: T2ImageSectionImage[];  // 최대 4개
}

// ── Contact Section ───────────────────────────

export interface T2ContactSection {
  phone1?: string;
  phone2?: string;
  email1?: string;
  email2?: string;
  email3?: string;
  instagram_url?: string;
  tiktok_url?: string;
  youtube_url?: string;
  extra_description?: string;
}

// ── Full Template 2 Data ──────────────────────

export interface Template2Data {
  username: string;
  name_section: T2NameSection;
  album_section: T2AlbumSection;
  text_sections: T2TextSection[];
  image_sections: T2ImageSection[];
  contact_section: T2ContactSection;
}
