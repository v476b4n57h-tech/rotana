/**
 * ROTANA salon content (temporary).
 *
 * Phase 1 keeps the content of the original website exactly as it was,
 * including its placeholders ("[€ PRIJS]", "[TELEFOON]", ...). From phase 3 on,
 * this data comes from the database and is editable in the admin dashboard.
 * Team names and booking times are fictional demo data (no real customers).
 */
import type { StaticImageData } from "next/image";

import heroSignage from "@/assets/images/hero-signage.jpg";
import logo from "@/assets/images/logo.jpg";
import moodMen1 from "@/assets/images/mood-men-1.jpg";
import moodMen1Bg from "@/assets/images/mood-men-1-bg.jpg";
import moodMen2 from "@/assets/images/mood-men-2.jpg";
import moodMen2Bg from "@/assets/images/mood-men-2-bg.jpg";
import moodWomen1 from "@/assets/images/mood-women-1.jpg";
import moodWomen1Bg from "@/assets/images/mood-women-1-bg.jpg";
import moodWomen2 from "@/assets/images/mood-women-2.jpg";
import moodWomen2Bg from "@/assets/images/mood-women-2-bg.jpg";
import moodWomen3 from "@/assets/images/mood-women-3.jpg";
import moodWomen3Bg from "@/assets/images/mood-women-3-bg.jpg";
import work01 from "@/assets/images/work-01.jpg";
import work02 from "@/assets/images/work-02.jpg";
import work03 from "@/assets/images/work-03.jpg";
import work04 from "@/assets/images/work-04.jpg";
import work05 from "@/assets/images/work-05.jpg";
import work06 from "@/assets/images/work-06.jpg";
import work07 from "@/assets/images/work-07.jpg";
import work08 from "@/assets/images/work-08.jpg";
import work09 from "@/assets/images/work-09.jpg";
import work10 from "@/assets/images/work-10.jpg";

export type Group = "men" | "women";

export interface Service {
  name: string;
  description: string;
  /** Price in cents. `null` = not filled in yet (shows the "[€ PRIJS]" placeholder). */
  priceCents: number | null;
}

export interface Slide {
  image: StaticImageData;
  /** Tiny pre-blurred version used as the backdrop behind the photo. */
  backdrop: StaticImageData;
  alt: string;
}

export interface WorkItem {
  image: StaticImageData;
  alt: string;
  group: Group;
}

export interface Person {
  name: string;
  role: string;
}

export const salon = {
  name: "ROTANA",
  logo,
  street: "[STRAATNAAM EN HUISNUMMER]",
  postcode: "[POSTCODE]",
  city: "Alkmaar",
  phone: "[TELEFOON]",
  email: "[E-MAIL]",
  kvk: "[KVK-NUMMER]",
  btw: "[BTW-NUMMER]",
  privacyLink: "[LINK]",
  termsLink: "[LINK]",
};

export const hero = {
  eyebrow: "Hair Style · Men & Women",
  titleStart: "Knippen en verzorgen, voor ",
  titleEnd: ".",
  rotatingWords: ["hem", "haar", "hem en haar"],
  intro: "Persoonlijk advies, een rustige sfeer en zorgvuldig vakwerk. Plan eenvoudig online je afspraak.",
  image: heroSignage,
  imageAlt: "ROTANA Hair Style, Men & Women, lichtreclame met logo",
  imageNote:
    "[Tijdelijk beeld: concept van de gevelreclame. Vervang dit later door een echte foto van het salon.]",
};

export const tickerWords = ["Knippen", "Baard", "Kleuren", "Highlights", "Styling", "Wenkbrauwen"];

export const mood: { group: Group; title: string; note: string; slides: Slide[] }[] = [
  {
    group: "men",
    title: "Heren",
    note: "Knippen, fade en baardverzorging",
    slides: [
      { image: moodMen1, backdrop: moodMen1Bg, alt: "Herenkapsel met fade en baard" },
      { image: moodMen2, backdrop: moodMen2Bg, alt: "Baardverzorging met strakke contouren" },
    ],
  },
  {
    group: "women",
    title: "Dames",
    note: "Knippen, kleuren en highlights",
    slides: [
      { image: moodWomen1, backdrop: moodWomen1Bg, alt: "Damesknipbeurt in koperrood" },
      { image: moodWomen2, backdrop: moodWomen2Bg, alt: "Donker haar met rode accenten" },
      { image: moodWomen3, backdrop: moodWomen3Bg, alt: "Highlights in warm blond" },
    ],
  },
];

export const moodNote =
  "[Tijdelijke voorbeeldfoto's. Vervang ze door eigen foto's van het salon en ons werk voordat de website live gaat.]";

export const whyUs = {
  title: "Waarom ROTANA",
  items: [
    {
      title: "Voor hem en haar",
      text: "Heren, dames en baardverzorging onder één dak, met dezelfde aandacht voor detail.",
    },
    {
      title: "Persoonlijk advies",
      text: "Eerst luisteren, dan knippen. Je krijgt een stijl die bij je past en bij je dagelijks leven.",
    },
    {
      title: "Rustige sfeer",
      text: "Een verzorgde, ontspannen omgeving waar je even de tijd voor jezelf neemt.",
    },
  ],
};

export const serviceGroups: Record<Group, { title: string; summary: string }> = {
  men: { title: "Heren", summary: "Knippen, baard en verzorging" },
  women: { title: "Dames", summary: "Knippen, kleuren en stylen" },
};

export const services: Record<Group, Service[]> = {
  men: [
    { name: "Knippen heren", description: "Wassen, knippen en stylen.", priceCents: null },
    { name: "Baard trimmen", description: "Contouren en model, met scheermes afgewerkt.", priceCents: null },
    { name: "Haar en baard", description: "Knippen en baard in één afspraak.", priceCents: null },
    {
      name: "Scheren met warm doekje",
      description: "Klassiek scheren met warme handdoek.",
      priceCents: null,
    },
    { name: "Kinderen tot 12 jaar", description: "Knippen voor de kleintjes.", priceCents: null },
    {
      name: "Wenkbrauwen, neus en oren",
      description: "Netjes verzorgd met trimmer of wax.",
      priceCents: null,
    },
    { name: "Haar kleuren heren", description: "Grijs bijkleuren of een nieuwe tint.", priceCents: null },
    { name: "Gezichtsverzorging", description: "Reiniging en verzorgend masker.", priceCents: null },
  ],
  women: [
    { name: "Knippen", description: "Knippen op maat, passend bij jouw haar en stijl.", priceCents: null },
    { name: "Wassen & föhnen", description: "Haar wassen en föhnen.", priceCents: null },
    { name: "Kleuren", description: "Volledige kleuring in één tint.", priceCents: null },
    { name: "Highlights", description: "Lichte accenten voor meer diepte en glans.", priceCents: null },
    { name: "Wenkbrauwen", description: "Vormgeven en verzorgen van je wenkbrauwen.", priceCents: null },
    { name: "Styling", description: "Krullen, model of kapsel voor een gelegenheid.", priceCents: null },
  ],
};

export const servicesNote =
  "Voorstel voor de heren-diensten: haal weg wat jullie niet aanbieden. Vul overal de echte prijzen in.";

export const work: WorkItem[] = [
  { image: work01, alt: "Barbier en verzorging met warm doekje", group: "men" },
  { image: work02, alt: "Fade met baard en warm doekje", group: "men" },
  { image: work03, alt: "Low taper fade met baard", group: "men" },
  { image: work04, alt: "Fade met textuur van achteren", group: "men" },
  { image: work05, alt: "Haar stylen tijdens het knippen", group: "men" },
  { image: work06, alt: "Fade met baard en hoodie", group: "men" },
  { image: work07, alt: "Fade met strakke baard", group: "men" },
  { image: work08, alt: "Bob met highlights van achteren", group: "women" },
  { image: work09, alt: "Gelaagde bob met highlights", group: "women" },
  { image: work10, alt: "Gelaagde bob in warm blond", group: "women" },
];

/** Fictional demo team (the original site says so too). */
export const people: Record<Group, Person[]> = {
  men: [
    { name: "Daan", role: "Fade en baard" },
    { name: "Yusuf", role: "Klassiek knippen" },
    { name: "Milan", role: "Baardverzorging" },
    { name: "Bram", role: "Scheren met warm doekje" },
  ],
  women: [
    { name: "Sanne", role: "Knippen en stylen" },
    { name: "Lotte", role: "Kleuren en föhnen" },
  ],
};

/** Demo booking grid: 20 slots of 30 minutes from 09:00. */
export const bookingDemo = { firstSlotMinutes: 540, slotMinutes: 30, slotCount: 20, daysAhead: 7 };

export const openingHours: { day: string; hours: string }[] = [
  { day: "Maandag", hours: "09:00 – 19:00" },
  { day: "Dinsdag", hours: "09:00 – 19:00" },
  { day: "Woensdag", hours: "09:00 – 19:00" },
  { day: "Donderdag", hours: "09:00 – 19:00" },
  { day: "Vrijdag", hours: "09:00 – 19:00" },
  { day: "Zaterdag", hours: "09:00 – 19:00" },
  { day: "Zondag", hours: "09:00 – 19:00" },
];

/** Social media links. Empty = not set yet (the site shows a demo message). */
export const socialLinks = { instagram: "", tiktok: "", facebook: "", whatsapp: "" };
