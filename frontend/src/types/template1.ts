// ──────────────────────────────────────────────
// Template 1 : 창작자 (Music Producer / Composer)
// ──────────────────────────────────────────────

export interface T1Job {
  id: number;
  name: string;
}

export interface T1NameSection {
  name: string;
  english_name: string;
  description1?: string;
  description2?: string;
  thumbnail_url?: string;
  jobs: T1Job[];
}

// ── Album Section Cards ───────────────────────

export interface T1YoutubeCard {
  type: "youtube";
  order: number;
  link: string;                  // YouTube URL or embed URL
  project_title?: string;        // 섹션 레이블 e.g. "FEATURED WORK 01"
  project_subtitle?: string;
  album_name?: string;
  composer?: string;
  category_desc?: string;
  year?: number;
  description?: string;
}

export interface T1SoundcloudCard {
  type: "soundcloud";
  order: number;
  link: string;                  // SoundCloud track URL
  project_title?: string;
  project_subtitle?: string;
  album_name?: string;
  composer?: string;
  category_desc?: string;
  year?: number;
  description?: string;
}

export interface T1ImageCard {
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

export interface T1NoImageCard {
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

export type T1AlbumCard =
  | T1YoutubeCard
  | T1SoundcloudCard
  | T1ImageCard
  | T1NoImageCard;

export interface T1AlbumSection {
  cards: T1AlbumCard[];          // order 순 정렬
}

// ── Text Section ──────────────────────────────

export interface T1TextCardBodyItem {
  order: number;
  title?: string;                // e.g. "Project"
  content?: string;              // e.g. "Children's Song Production Series"
}

export interface T1TextCard {
  order: number;
  title?: string;                // e.g. "㈜배움 Baeum Co., Ltd."
  detail?: string;
  body_items: T1TextCardBodyItem[];
}

export interface T1TextSection {
  order: number;
  title?: string;                // e.g. "Collaboration · Clients"
  description?: string;
  cards: T1TextCard[];
}

// ── Contact Section ───────────────────────────

export interface T1ContactSection {
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

// ── Full Template 1 Data ──────────────────────

export interface Template1Data {
  username: string;              // URL slug
  name_section: T1NameSection;
  album_section: T1AlbumSection;
  text_sections: T1TextSection[];
  contact_section: T1ContactSection;
}
