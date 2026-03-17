const imageModules = import.meta.glob("../assets/images/*", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const img = (filename: string): string =>
  imageModules[`../assets/images/${filename}`] ?? "";

export const ASSETS = {
  logo: img("logo.svg"),
  logoFooter: img("logo.svg"),
  heroBg1: img("hero-bg-1.png"),
  heroBg2: img("hero-bg-2.png"),
  discoverCard1: img("discover-1.png"),
  discoverCard2: img("discover-2.png"),
  discoverCard3: img("discover-3.png"),
  discoverCard4: img("discover-4.png"),
  spotlightAlbum: img("spotlight-album.png"),
  ctaBg: img("cta-bg.png"),
  iconSearch: img("icon-search.svg"),
  iconMail: img("icon-mail.svg"),
  iconWebsite: img("icon-website.svg"),
  iconInstagram: img("icon-instagram.svg"),
} as const;
