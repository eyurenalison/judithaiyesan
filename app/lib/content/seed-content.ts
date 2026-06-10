import type { Album, EventItem, HeroSlide, Lyric, SiteSettings } from "./types";

export const siteSettings: SiteSettings = {
  siteName: "Judith Aiyesan",
  logoSrc: "/images/core-img/logoj.png",
  faviconSrc: "/images/core-img/logoj.png",
  contactEmail: "info@judithaiyesan.com",
  contactPhone: "+234 816 752 9122",
  contactAddress: "Plot 5, Sani Abacha Road GRA Phase 3, Port Harcourt.",
};

export const heroSlides: HeroSlide[] = [
  {
    title: "The Upper Room",
    subtitle: "Upcoming worship gathering",
    imageSrc: "/images/upcoming.jpeg",
    buttonLabel: "View Events",
    buttonUrl: "/events",
    order: 0,
    published: true,
  },
  {
    title: "OBA - King Of Kings",
    subtitle: "Listen to the latest sound",
    imageSrc: "/images/bg-img/oba.jpg",
    buttonLabel: "Listen",
    buttonUrl: "https://minjuditha.hearnow.com/oba-king-of-kings",
    order: 1,
    published: true,
  },
  {
    title: "Victorious",
    subtitle: "Sophomore single",
    imageSrc: "/images/bg-img/j-1.jpg",
    buttonLabel: "Listen",
    buttonUrl: "/audio/Victorious.mp3",
    order: 2,
    published: true,
  },
  {
    title: "The Greatest Name",
    subtitle: "Debut single",
    imageSrc: "/images/bg-img/j-2.png",
    buttonLabel: "Listen",
    buttonUrl: "/audio/The Greatest Name.mp3",
    order: 3,
    published: true,
  },
];

export const albums: Album[] = [
  {
    title: "Oghene Doh",
    subtitle: "Latest release",
    coverSrc: "/images/oghene-doh.jpeg",
    listenHref:
      "https://distrokid.com/hyperfollow/minjuditha/oghene-doh-god-i-thank-you/",
    downloadHref: "/audio/Oghene Doh (God, I Thank You) - Min. Juditha.mp3",
    audioSrc: "/audio/Oghene Doh (God, I Thank You) - Min. Juditha.mp3",
    featured: true,
    order: 0,
    published: true,
  },
  {
    title: "Clear My Gbese",
    subtitle: "Single",
    coverSrc: "/images/gbese.jpg",
    listenHref: "https://minjuditha.hearnow.com/clear-my-gb%C3%A9s%C3%A9",
    downloadHref: "/audio/clear_my_gbese_mp3_38921.mp3",
    featured: true,
    order: 1,
    published: true,
  },
  {
    title: "Victorious",
    subtitle: "Sophomore single",
    coverSrc: "/images/bg-img/victorious.jpg",
    listenHref: "/audio/Victorious.mp3",
    downloadHref: "/audio/Victorious.mp3",
    audioSrc: "/audio/Victorious.mp3",
    featured: true,
    order: 2,
    published: true,
  },
  {
    title: "The Greatest Name",
    subtitle: "Debut single",
    coverSrc: "/images/bg-img/gn.jpg",
    listenHref: "/audio/The Greatest Name.mp3",
    downloadHref: "/audio/The Greatest Name.mp3",
    audioSrc: "/audio/The Greatest Name.mp3",
    featured: true,
    order: 3,
    published: true,
  },
];

const upperRoomGallery = Array.from({ length: 40 }, (_, index) => {
  const imageNumber = index + 1;

  return {
    src: `/images/upper-room/upr${imageNumber}.jpg`,
    alt: `Upper Room gallery image ${imageNumber}`,
  };
});

export const events: EventItem[] = [
  {
    title: "The Upper Room",
    status: "Upcoming",
    date: "March 29, 2026 at 4:00 PM",
    location: "Celebr8 Center, Olu Obassanjo Road, PH",
    description:
      "Join us for an unforgettable worship gathering with music, prayer, and community.",
    imageSrc: "/images/upcoming.jpeg",
    published: true,
  },
  {
    title: "Upper Room",
    status: "Past",
    date: "March 16, 2025 at 4:00 PM",
    location:
      "Plot 5 Sanni Abacha Road Beside the Police Station, G.R.A, Port Harcourt",
    description:
      "Hearts were stirred and spirits lifted as worship filled the room.",
    imageSrc: "/images/upper.jpg",
    gallery: upperRoomGallery,
    published: true,
  },
];

export const lyrics: Lyric[] = [
  {
    title: "The Greatest Name",
    summary:
      "A worship song centered on the power, victory, salvation, and peace in the name of Jesus.",
    body: "Come let us worship him. Come let us praise his name.",
    coverSrc: "/images/bg-img/gn.jpg",
    published: true,
  },
  {
    title: "Victorious",
    summary:
      "A declaration of faith, victory, inheritance, joy, and walking in the finished work of Christ.",
    body: "We are victorious. We are walking in victory.",
    coverSrc: "/images/bg-img/victorious.jpg",
    published: true,
  },
];
