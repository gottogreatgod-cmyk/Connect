/**
 * Kestrel Vale — Alpine Collective.
 * One valley, six houses. Fictional brand; all proof content is demo.
 * Data powers every section of the single-page flagship site.
 */

export const BRAND = {
  name: "Kestrel Vale",
  tagline: "One valley. Six houses.",
  est: "1984",
  phone: "+1 (555) 014-2400",
  phoneHref: "tel:+15550142400",
  email: "stay@kestrelvale.demo",
  address: "4 Pass Road, Vale Hollow",
  region: "Kestrel Vale, Pine County",
  domain: "kestrelvale.demo",
} as const;

export const ANNOUNCEMENT =
  "First snow is close — winter stays open Dec 6 · Supper Club “Fire & Ice” tickets live Fri 10:00";

/** Six houses = the divisions of the collective. */
export type DivisionKey = "stay" | "dine" | "drink" | "cafe" | "adventure" | "camp" | "celebrate";

export const DIVISIONS: {
  key: DivisionKey;
  anchor: string;
  house: string;
  kind: string;
  blurb: string;
  hours: string;
  img: string;
  cta: string;
}[] = [
  {
    key: "stay",
    anchor: "#stay",
    house: "The Kestrel Lodge",
    kind: "Stay · 24 rooms",
    blurb: "Timber suites above the lake, morning mist off the water, breakfast included.",
    hours: "Check-in 15:00",
    img: "/img/lodge-exterior.jpg",
    cta: "Find your room",
  },
  {
    key: "dine",
    anchor: "#dine",
    house: "Hearth & Vale",
    kind: "Dine · 18-seat counter",
    blurb: "A seven-course reading of the valley, served by candlelight at one long oak table.",
    hours: "Wed–Sun · 18:30",
    img: "/img/dining-hall.jpg",
    cta: "See the menu",
  },
  {
    key: "drink",
    anchor: "#drink",
    house: "The Vessel",
    kind: "Drink · Winery & cellar",
    blurb: "Terraced vines, a candle-lit barrel hall, and a club that ships four times a year.",
    hours: "Thu–Sun · 11:00",
    img: "/img/wine-cellar.jpg",
    cta: "Taste the valley",
  },
  {
    key: "cafe",
    anchor: "#cafe",
    house: "Meadowlark & Ember",
    kind: "Café · Bakery · Pizzeria",
    blurb: "Cardamom buns at seven, wood-fired pies from six. One counter, two personalities.",
    hours: "Daily · 07:00–21:00",
    img: "/img/cafe-counter.jpg",
    cta: "Order ahead",
  },
  {
    key: "adventure",
    anchor: "#adventure",
    house: "Trailhead",
    kind: "Outfitting · Guided trips",
    blurb: "Ridge traverses, dawn canoe, forage-and-fire. Guides who have read this valley for years.",
    hours: "Daily · 06:30",
    img: "/img/trail-ridge.jpg",
    cta: "Pick a route",
  },
  {
    key: "camp",
    anchor: "#camp",
    house: "The Grove",
    kind: "Camp · 11 pitches + barn",
    blurb: "River-meadow sites under the milky way, firewood delivered to your ring.",
    hours: "May–Oct",
    img: "/img/camp-night.jpg",
    cta: "Choose a site",
  },
];

/* ------------------------------------------------------------------ Stay */

export const ROOMS = [
  {
    id: "aspen",
    name: "Aspen Suite",
    price: 340,
    unit: "night",
    sleeps: 2,
    size: "48 m²",
    bed: "King · balcony",
    view: "Lake & ridge",
    floor: "2nd floor, south corner",
    amenities: ["Soaking tub", "Balcony", "Reading nook", "Record player", "Mountain radio"],
    img: "/img/room-suite.jpg",
    note: "The corner suite. Sun until the ridge takes it at nine.",
    policies: "Free cancellation to 72h · no deposit for Vale Club",
  },
  {
    id: "vale",
    name: "Vale Room",
    price: 240,
    unit: "night",
    sleeps: 2,
    size: "32 m²",
    bed: "Queen · window seat",
    view: "Meadow & pines",
    floor: "1st–2nd floor",
    amenities: ["Window seat", "Rain shower", "Wool throws", "Tea tray"],
    img: "/img/room-suite.jpg",
    note: "The room most guests ask to rebook.",
    policies: "Free cancellation to 72h",
  },
  {
    id: "attic",
    name: "The Attic",
    price: 190,
    unit: "night",
    sleeps: 2,
    size: "24 m²",
    bed: "Queen under eaves",
    view: "Round window, ridge",
    floor: "3rd floor",
    amenities: ["Skylight over bed", "Steep stairs", "Quietest room", "Writing desk"],
    img: "/img/room-attic.jpg",
    note: "Sloped ceilings, a skylight for the milky way, and nothing above you but beams.",
    policies: "Not suitable for mobility aids · 72h cancellation",
  },
  {
    id: "grove-tent",
    name: "Grove Tent",
    price: 150,
    unit: "night",
    sleeps: 3,
    size: "20 m² canvas",
    bed: "King + futon · wood stove",
    view: "River meadow",
    floor: "The Grove, pitch T1–T2",
    amenities: ["Wood stove", "Fire bundle nightly", "Sauna pass", "Lantern", "100 m to showers"],
    img: "/img/tent-glamp.jpg",
    note: "Pre-pitched canvas at The Grove — glamping with a real door latch.",
    policies: "May–Oct only · weather-hold free move",
  },
] as const;

export const STAY_PACKAGES = [
  {
    id: "slow",
    name: "Slow Weekend",
    price: 812,
    was: 916,
    per: "2 nights · 2 guests",
    includes: ["Vale Room both nights", "Breakfast for two, both mornings", "Cellar tasting (4 pours)", "Late checkout 13:00"],
    tag: "Most booked",
  },
  {
    id: "summit",
    name: "Summit & Soak",
    price: 1098,
    was: 1246,
    per: "2 nights · 2 guests",
    includes: ["Aspen Suite both nights", "Guided Ridge Traverse for two", "Sauna & cold plunge", "Dinner at Hearth (3 courses)"],
    tag: "Signature",
  },
  {
    id: "desk",
    name: "Field Desk",
    price: 1540,
    was: 1730,
    per: "7 nights · 1–2 guests",
    includes: ["Any room, a week", "Meadowlark coffee credit $12/day", "Reserved desk by the window", "One laundry run"],
    tag: "Workation",
  },
] as const;

export const STAY_EXTRAS = [
  { id: "breakfast", label: "Breakfast, per guest / day", price: 18 },
  { id: "firewood", label: "Fire bundle delivered nightly", price: 9 },
  { id: "dog", label: "Dog in room (bed + bowls provided)", price: 25 },
  { id: "sauna", label: "Sauna & plunge, per guest", price: 22 },
  { id: "transfer", label: "Valley shuttle, round trip", price: 40 },
] as const;

export const PROMOS: Record<string, { pct: number; label: string }> = {
  VALE10: { pct: 10, label: "Vale Club reopening — 10% off" },
  FIRSTSNOW: { pct: 15, label: "First snow — 15% off winter" },
};

/* ------------------------------------------------------------------ Dine */

export const MENU = {
  tasting: {
    name: "Valley Reading",
    courses: 7,
    price: 95,
    pairing: 60,
    duration: "3 hours",
    summary: "Seven movements from the lake, the ridge, and the cellar. One seating, candlelight, the kitchen in full view.",
  },
  boards: [
    {
      id: "start",
      label: "To Start",
      items: [
        { name: "Trout crudo, cucumber water, dill oil", price: 18, note: "lake trout · cured 40 min" },
        { name: "Charred leek, hazelnut praline, smoked cream", price: 16, note: "vegetarian" },
        { name: "Rye & cultured butter, valley salt", price: 9, note: "sourdough rye, baked at 06:00" },
      ],
    },
    {
      id: "mains",
      label: "Mains",
      items: [
        { name: "Venison, foraged berries, pine", price: 42, note: "ridge venison · dark ceramic" },
        { name: "Alpine char, burnt butter, sorrel", price: 38, note: "lake-raised" },
        { name: "Celeriac baked in salt dough, black garlic", price: 31, note: "vegan · 48h ferment" },
        { name: "Pappardelle, venison ragù, chestnut", price: 34, note: "egg pasta rolled daily" },
      ],
    },
    {
      id: "end",
      label: "To End",
      items: [
        { name: "Buckwheat tart, bay leaf cream", price: 13, note: "gluten-free buckwheat" },
        { name: "Cellar cheese, quince, walnut bread", price: 19, note: "from The Vessel" },
        { name: "Pine tip ice cream, honeycomb", price: 11, note: "tips picked in June" },
      ],
    },
  ],
} as const;

/** DailySpecials — rotates by real weekday. */
export const SPECIALS: { day: string; dish: string; price: number; note: string }[] = [
  { day: "Wednesday", dish: "Roast chicken, bread salad, pan drippings", price: 29, note: "one bird, four tables" },
  { day: "Thursday", dish: "Fisherman's pie, charred lemon", price: 27, note: "smoked whitefish" },
  { day: "Friday", dish: "Ribeye for two, ember butter, watercress", price: 88, note: "45-day dry aged" },
  { day: "Saturday", dish: "Tasting counter — full Valley Reading", price: 95, note: "7 courses" },
  { day: "Sunday", dish: "Slow lunch: shoulder of lamb, flatbreads, herbs", price: 32, note: "served 12:30–15:30" },
  { day: "Monday", dish: "Closed — the kitchen forages", price: 0, note: "back Wednesday" },
  { day: "Tuesday", dish: "Closed — the kitchen forages", price: 0, note: "back Wednesday" },
];

export const WINES = [
  { name: "Vessel · Riesling “Terrace”", type: "white", year: "2022", glass: 14, bottle: 58, note: "slate, lime blossom, long finish" },
  { name: "Vessel · Pinot Gris “Ash”", type: "orange", year: "2021", glass: 15, bottle: 62, note: "skin contact 21 days, apricot" },
  { name: "Vessel · Field Blend “Moraine”", type: "red", year: "2020", glass: 17, bottle: 72, note: "savoury, cherry stone, pine" },
  { name: "Vessel · Brut Nature “Kestrel”", type: "sparkling", year: "2019", glass: 21, bottle: 88, note: "36 months on lees, brioche" },
  { name: "Small grower · Gruner Veltliner", type: "white", year: "2022", glass: 13, bottle: 54, note: "white pepper, orchard" },
  { name: "Small grower · Gamay “Granite”", type: "red", year: "2021", glass: 15, bottle: 61, note: "crunchy, served with a chill" },
  { name: "Small grower · Pet-Nat “Dusk”", type: "sparkling", year: "2022", glass: 16, bottle: 67, note: "hazy, wild ferment" },
  { name: "Small grower · Chardonnay “Limestone”", type: "white", year: "2020", glass: 18, bottle: 74, note: "cider apples, toast" },
] as const;

export const WINE_FILTERS = [
  { id: "all", label: "The list" },
  { id: "red", label: "Red" },
  { id: "white", label: "White" },
  { id: "orange", label: "Orange" },
  { id: "sparkling", label: "Sparkling" },
] as const;

export type ClubTier = {
  id: string;
  name: string;
  price: number;
  per: string;
  bottles: string;
  perks: string[];
  tag?: string;
};

export const CLUB_TIERS: ClubTier[] = [
  {
    id: "slate",
    name: "Slate",
    price: 45,
    per: "month",
    bottles: "2 bottles",
    perks: ["Cellar-allocated wines", "Free tastings for two", "10% off Hearth dinners"],
  },
  {
    id: "quartz",
    name: "Quartz",
    price: 85,
    per: "month",
    bottles: "4 bottles",
    perks: ["Everything in Slate", "Early access to releases", "Harvest supper seat", "1 guest tasting / month"],
    tag: "Most loved",
  },
  {
    id: "granite",
    name: "Granite",
    price: 140,
    per: "month",
    bottles: "6 bottles + cellar picks",
    perks: ["Everything in Quartz", "A named cask after 12 months", "$20 Hearth credit monthly", "First call on cancellations"],
  },
] as const;

/* ------------------------------------------------------------------ Café */

export const CAFE_ITEMS = [
  { id: "bun", name: "Cardamom bun", price: 5, cat: "bakery", desc: "twice-knotted, pearl sugar", icon: "croissant" },
  { id: "croissant", name: "Butter croissant", price: 4.5, cat: "bakery", desc: "72h laminated", icon: "croissant" },
  { id: "painr", name: "Pain raisin", price: 5.5, cat: "bakery", desc: "rum custard", icon: "croissant" },
  { id: "esp", name: "Espresso", price: 3.5, cat: "coffee", desc: "Vale Blend, 18g in 27s", icon: "coffee" },
  { id: "latte", name: "Latte", price: 4.5, cat: "coffee", desc: "on oat or whole", icon: "coffee" },
  { id: "filter", name: "Batch filter", price: 4, cat: "coffee", desc: "single valley lot", icon: "coffee" },
  { id: "granola", name: "Granola & kefir", price: 9, cat: "kitchen", desc: "toasted seeds, berry compote", icon: "bowl" },
  { id: "toast", name: "Sourdough & jam", price: 7, cat: "kitchen", desc: "house cultured butter", icon: "toast" },
  { id: "focaccia", name: "Focaccia slab", price: 8, cat: "kitchen", desc: "rosemary, sea salt", icon: "toast" },
] as const;

export const PIZZA_BASE = 14;
export const PIZZA_SIZES = [
  { id: "s", label: "10″ personal", delta: 0 },
  { id: "m", label: "14″ sharing", delta: 6 },
  { id: "l", label: "18″ table", delta: 11 },
] as const;
export const PIZZA_SAUCE = [
  { id: "tom", label: "San Marzano", delta: 0 },
  { id: "cream", label: "Cream & sage", delta: 1 },
  { id: "pesto", label: "Basil pesto", delta: 2 },
] as const;
export const PIZZA_CHEESE = [
  { id: "fiord", label: "Fior di latte", delta: 0 },
  { id: "vegan", label: "Cashew mozza (v)", delta: 2 },
  { id: "blue", label: "Blue cheese", delta: 3 },
] as const;
export const TOPPINGS = [
  { id: "mush", label: "Roasted mushrooms", price: 3, vegan: true },
  { id: "prosc", label: "Prosciutto di Parma", price: 5, vegan: false },
  { id: "ruc", label: "Rocket & lemon", price: 2, vegan: true },
  { id: "cara", label: "Caramelised onion", price: 2, vegan: true },
  { id: "truf", label: "Truffle cream", price: 6, vegan: false },
  { id: "olive", label: "Taggiasca olives", price: 2, vegan: true },
  { id: "egg", label: "Cured egg yolk", price: 3, vegan: false },
  { id: "chili", label: "Calabrian chili honey", price: 2, vegan: false },
] as const;

export const CAFE_PRODUCTS = [
  { id: "beans", name: "Vale Blend · 250g", price: 18, desc: "cacao, plum, burnt sugar", img: "/img/beans-product.jpg", cat: "pantry" },
  { id: "granola-bag", name: "Camp granola · 500g", price: 12, desc: "the breakfast of summits", img: "", cat: "pantry" },
  { id: "mug", name: "Stoneware mug", price: 24, desc: "thumbed by a local potter", img: "", cat: "home" },
  { id: "candles", name: "Pine tip candle", price: 19, desc: "burns like the trail smells", img: "", cat: "home" },
  { id: "map", name: "Valley trail map · A2", price: 9, desc: "surveyed 2024, water-resistant", img: "", cat: "field" },
  { id: "firekit", name: "Fire bundle + kindling", price: 9, desc: "delivered to your ring", img: "", cat: "field" },
] as const;

export const SUBSCRIPTIONS = [
  { id: "w1", label: "Every week", per: 18, note: "for the deeply caffeinated" },
  { id: "w2", label: "Every 2 weeks", per: 18, note: "the house standard" },
  { id: "w4", label: "Every 4 weeks", per: 19, note: "rests beautifully" },
] as const;

/** Zones for the delivery estimator (km from the counter). */
export const DELIVERY_ZONES = [
  { id: "z0", label: "Pickup at the counter", km: 0, fee: 0, eta: "12 min" },
  { id: "z1", label: "Vale Hollow village", km: 2, fee: 3, eta: "25–35 min" },
  { id: "z2", label: "The Grove / lakeshore", km: 5, fee: 6, eta: "35–50 min" },
  { id: "z3", label: "Further out (Pass Road)", km: 12, fee: 11, eta: "50–70 min" },
] as const;

/* ------------------------------------------------------------------ Adventure */

export type Difficulty = 1 | 2 | 3;

export const EXPERIENCES = [
  {
    id: "ridge",
    name: "Ridge Traverse",
    difficulty: 3 as Difficulty,
    hours: 6,
    price: 145,
    meet: "Trailhead hut · 06:30",
    guide: "Mara Chen",
    season: "Jun–Oct",
    desc: "The full spine of the Kestrel ridge, hands on granite, three cols and a rope-assisted descent.",
    fitness: "Sure-footed, comfortable with exposure and 900 m of climbing.",
    img: "/img/trail-ridge.jpg",
    slots: ["06:30", "07:15"],
  },
  {
    id: "canoe",
    name: "Dawn Canoe",
    difficulty: 1 as Difficulty,
    hours: 2,
    price: 65,
    meet: "Lake jetty · 05:45",
    guide: "Jonas Berg",
    season: "May–Oct",
    desc: "The lake before the wind. Coffee from a thermos, herons working the reeds.",
    fitness: "None. Dress warm.",
    img: "/img/lake-canoe.jpg",
    slots: ["05:45", "06:30", "07:15"],
  },
  {
    id: "forage",
    name: "Forage & Fire",
    difficulty: 2 as Difficulty,
    hours: 3,
    price: 95,
    meet: "Meadowlark counter · 10:00",
    guide: "Nell Okafor",
    season: "Apr–Oct",
    desc: "Walk the moraine with a chef, gather what the season offers, cook it over fire at the river.",
    fitness: "Easy walking, some off-trail.",
    img: "/img/vineyard.jpg",
    slots: ["10:00", "14:00"],
  },
  {
    id: "falls",
    name: "Via the Falls",
    difficulty: 3 as Difficulty,
    hours: 5,
    price: 130,
    meet: "Trailhead hut · 08:00",
    guide: "Petra Vale",
    season: "Jun–Sep",
    desc: "Gorge trail to the twin falls — spray rainbows, a swimmable pool, and a headlamp for the last cave.",
    fitness: "Steady on wet rock.",
    img: "/img/lake-canoe.jpg",
    slots: ["08:00"],
  },
  {
    id: "ebike",
    name: "Valley E-Bike Loop",
    difficulty: 1 as Difficulty,
    hours: 3,
    price: 85,
    meet: "Trailhead hut · 10:00",
    guide: "Sam Ruiz",
    season: "Apr–Oct",
    desc: "42 km of gravel and singletrack, a bakery stop at the halfway, geology read aloud on the climbs.",
    fitness: "Pedal assist included.",
    img: "/img/village.jpg",
    slots: ["10:00", "13:30"],
  },
  {
    id: "summit",
    name: "Alpine Start",
    difficulty: 3 as Difficulty,
    hours: 8,
    price: 210,
    meet: "Trailhead hut · 04:45",
    guide: "Mara Chen",
    season: "Jul–Sep",
    desc: "Kestrel Peak by 09:00, roped on the glacier headwall, breakfast on the summit plateau.",
    fitness: "Very good. 1,400 m gain.",
    img: "/img/trail-ridge.jpg",
    slots: ["04:45"],
  },
] as const;

export const GUIDES = [
  { name: "Mara Chen", role: "Head guide · WFR", years: 12, note: "Has drawn the trail map you'll carry.", img: "/img/guides.jpg" },
  { name: "Jonas Berg", role: "Canoe & river · SWR", years: 8, note: "Knows where the herons nest.", img: "/img/guides.jpg" },
  { name: "Petra Vale", role: "Gorge & falls · WFR", years: 9, note: "Counts the spray rainbows.", img: "/img/guides.jpg" },
  { name: "Nell Okafor", role: "Forager · chef", years: 6, note: "Can name every berry on the moraine.", img: "/img/chef-portrait.jpg" },
  { name: "Sam Ruiz", role: "Geologist · e-bike", years: 4, note: "Reads the valley like a page.", img: "/img/guides.jpg" },
] as const;

export type TrailStatus = "open" | "caution" | "closed";
export type TrailCondition = { id: string; name: string; status: TrailStatus; note: string };

export const TRAIL_CONDITIONS: TrailCondition[] = [
  { id: "t1", name: "Kestrel Ridge", status: "open", note: "dry granite, wind light" },
  { id: "t2", name: "Twin Falls gorge", status: "caution", note: "spray on the slabs — poles advised" },
  { id: "t3", name: "Moraine loop", status: "open", note: "blueberry season, bears active" },
  { id: "t4", name: "Pass Road climb", status: "open", note: "gravel fresh, 12°C at the col" },
  { id: "t5", name: "Lake circuit", status: "open", note: "mist until 08:30" },
] as const;

/* ------------------------------------------------------------------ Camp */

export const CAMP_SITES = [
  { id: "A1", zone: "Meadow", kind: "Pitch", price: 45, hookups: "none", sleeps: 4, note: "open sky, farthest from the road", x: 30, y: 22, area: "meadow" },
  { id: "A2", zone: "Meadow", kind: "Pitch", price: 45, hookups: "none", sleeps: 4, note: "next to the wildflower strip", x: 42, y: 26, area: "meadow" },
  { id: "A3", zone: "Meadow", kind: "Pitch", price: 45, hookups: "none", sleeps: 4, note: "the kite-flyers' favourite", x: 54, y: 20, area: "meadow" },
  { id: "A4", zone: "Meadow", kind: "Pitch", price: 45, hookups: "none", sleeps: 4, note: "close to the shower block", x: 66, y: 30, area: "meadow" },
  { id: "B1", zone: "Riverside", kind: "Pitch", price: 55, hookups: "water", sleeps: 4, note: "trout water 20 m away", x: 24, y: 56, area: "river" },
  { id: "B2", zone: "Riverside", kind: "Pitch", price: 55, hookups: "water", sleeps: 4, note: "you will fall asleep to the river", x: 38, y: 60, area: "river" },
  { id: "B3", zone: "Riverside", kind: "Pitch", price: 55, hookups: "water", sleeps: 4, note: "morning sun first", x: 52, y: 66, area: "river" },
  { id: "C1", zone: "Forest", kind: "Pitch", price: 60, hookups: "electric + water", sleeps: 6, note: "under the old pines, hammock trees", x: 66, y: 55, area: "forest" },
  { id: "C2", zone: "Forest", kind: "Pitch", price: 60, hookups: "electric + water", sleeps: 6, note: "the quietest corner of The Grove", x: 78, y: 48, area: "forest" },
  { id: "T1", zone: "Canvas", kind: "Pre-pitched tent", price: 150, hookups: "stove + lantern", sleeps: 3, note: "wood stove, fire bundle nightly", x: 20, y: 38, area: "canvas" },
  { id: "T2", zone: "Canvas", kind: "Pre-pitched tent", price: 150, hookups: "stove + lantern", sleeps: 3, note: "riverside canvas, sauna pass included", x: 33, y: 44, area: "canvas" },
] as const;

export const CAMP_AMENITIES = [
  { icon: "shower", name: "Hot showers", note: "two blocks, endless water" },
  { icon: "sauna", name: "Sauna & plunge", note: "book a slot at the hut" },
  { icon: "store", name: "Camp store", note: "milk, eggs, fire bundles, maps" },
  { icon: "laundry", name: "Laundry", note: "honor-system powder" },
  { icon: "fire", name: "Fire rings", note: "every pitch, wood delivered" },
  { icon: "dog", name: "Dog loop", note: "fenced, off-lead legal" },
] as const;

export const CAMP_RULES = [
  { rule: "Quiet hours", detail: "22:30–07:00 — the valley amplifies everything" },
  { rule: "Fires", detail: "Rings only. Bundles delivered 18:00 on request." },
  { rule: "Dogs", detail: "On-lead in the meadow, off-lead in the loop. Bags at the hut." },
  { rule: "Vehicles", detail: "Park at your pitch. No generators after 20:00." },
  { rule: "Checkout", detail: "11:00. Stay longer if nobody's coming." },
];

/* ------------------------------------------------------------------ Celebrate */

export const VENUES = [
  { id: "barn", name: "The Barn", seated: 80, standing: 120, price: 2800, note: "1840s timber, restored 2019", img: "/img/barn-wedding.jpg" },
  { id: "loft", name: "The Loft", seated: 30, standing: 45, price: 1200, note: "above the winery, candles only", img: "/img/wine-cellar.jpg" },
  { id: "meadow", name: "The Meadow", seated: 200, standing: 300, price: 4500, note: "the river bend, tented if wet", img: "/img/camp-night.jpg" },
] as const;

export const CATERING_TIERS = [
  { id: "plated", label: "Plated, three courses", per: 85, note: "Hearth kitchen, full service" },
  { id: "family", label: "Family style", per: 55, note: "long boards, seconds always" },
  { id: "graze", label: "Grazing table", per: 40, note: "from the bakery & the cellar" },
] as const;

export const EVENT_ADDONS = [
  { id: "lights", label: "Festoon & candle styling", price: 300 },
  { id: "florals", label: "Wild florals (in season)", price: 450 },
  { id: "sound", label: "Sound & a quiet DJ", price: 600 },
  { id: "sauna", label: "Sauna session for the party", price: 380 },
  { id: "canoe", label: "Dawn canoe for the morning after", price: 65 },
] as const;

export const PUBLIC_EVENTS = [
  { id: "harvest", name: "Harvest Supper", date: "2025-09-21", time: "18:00", where: "The Vessel barrel hall", price: "95", kind: "supper", blurb: "Long tables in the cellar, the new vintage poured young." },
  { id: "fullmoon", name: "Full Moon Tasting", date: "2025-09-29", time: "20:30", where: "The Vessel", price: "35", kind: "tasting", blurb: "Five pours by candlelight, no notes, just the moon." },
  { id: "clubday", name: "Vale Club Day", date: "2025-10-05", time: "11:00", where: "All houses", price: "0", kind: "open", blurb: "Every house open to everyone. Buns at seven, pies at six." },
  { id: "firstsnow", name: "First Snow Festival", date: "2025-12-14", time: "16:00", where: "The Kestrel Lodge", price: "25", kind: "festival", blurb: "Torchlit descent, fire pits, the valley's own noise." },
  { id: "fireice", name: "Supper Club — Fire & Ice", date: "2026-01-23", time: "19:00", where: "The Barn", price: "120", kind: "supper", blurb: "Six courses cooked on ember and served on ice. Sold out — join the waitlist." },
  { id: "maple", name: "Maple Weekend", date: "2026-03-08", time: "09:00", where: "Meadowlark", price: "15", kind: "weekend", blurb: "Tapping the sugar maples, pancakes until the sap runs dry." },
] as const;

export const SEAT_TIERS = [
  { id: "hearth", label: "Hearth counter", rows: 2, price: 120, note: "front row to the fire" },
  { id: "hall", label: "Hall table", rows: 4, price: 85, note: "the long oak tables" },
  { id: "loft", label: "Loft rail", rows: 3, price: 65, note: "looking down on the pass" },
] as const;

/* ------------------------------------------------------------------ Proof */

export const REVIEWS = [
  { name: "Ines & Tomas", source: "Stay journal", stars: 5, quote: "We came for the ridge and stayed for the buns. The valley does something to time.", visit: "Aspen Suite · 3 nights" },
  { name: "D. Whitfield", source: "Booking demo", stars: 5, quote: "The quietest luxury I've ever paid for. Nobody perform-s anything here.", visit: "The Attic · 2 nights" },
  { name: "Priya S.", source: "Google demo", stars: 5, quote: "Forage & Fire with Nell was the best 95 dollars of the year. We cooked our own lunch on a river stone.", visit: "Grove Tent · 2 nights" },
  { name: "The Marlowes", source: "Wedding file", stars: 5, quote: "They married us in the meadow and fed 80 in the barn. The festoon lights came on exactly as planned.", visit: "The Barn · 140 guests" },
  { name: "J. Okafor", source: "Vale Club", stars: 4, quote: "Slate club pays for itself by the second month. The Moraine is dangerously drinkable.", visit: "Quartz club · 8 months" },
  { name: "Fern & Kestrel", source: "Camp book", stars: 5, quote: "Woke at 03:00, stepped out, and the whole sky was on. Wood arrived at six.", visit: "B2 riverside · 4 nights" },
] as const;

export const PRESS = [
  { quote: "The quietest luxury in the alps.", source: "Vale Times", year: "2025" },
  { quote: "Six houses, one valley, zero pretense.", source: "Traverse Magazine", year: "2024" },
  { quote: "A masterclass in restraint.", source: "Fern & Fork", year: "2024" },
  { quote: "The tasting menu reads like a field guide.", source: "The Long Table", year: "2023" },
] as const;

export const AWARDS = [
  "Green Key — certified 2025",
  "Best Mountain Stay 2024 — Alpine Guild",
  "Bib Gourmand — Vale Guide 2025",
  "Dark Sky Commended 2024",
  "Trails Built & Maintained — 41 km",
] as const;

export const STATS = [
  { value: 12480, suffix: "", label: "nights hosted", demo: true },
  { value: 3127, suffix: "", label: "summits logged", demo: true },
  { value: 41, suffix: "st", label: "season in the valley", demo: true },
  { value: 96, suffix: "%", label: "would return", demo: true },
] as const;

/* ------------------------------------------------------------------ Field notes (journal / KB / careers) */

export const JOURNAL = [
  { id: "j1", title: "Why we ferment", cat: "kitchen", date: "2025-08-12", read: "6 min", blurb: "Nell on the cellar's quiet season — what 40 days of patience buys a plate.", img: "/img/dish-tasting.jpg" },
  { id: "j2", title: "Mapping the trail network", cat: "field", date: "2025-07-30", read: "9 min", blurb: "Mara walked all 41 km with a surveyor. Here's what changed on the map.", img: "/img/trail-ridge.jpg" },
  { id: "j3", title: "The barn's second life", cat: "houses", date: "2025-06-18", read: "5 min", blurb: "From cattle to vows: how we restored the 1840s timber without sanding the stories off.", img: "/img/barn-wedding.jpg" },
  { id: "j4", title: "Pine tips, six weeks a year", cat: "field", date: "2025-05-02", read: "4 min", blurb: "The foraging window that decides the ice cream and the gin for the next twelve months.", img: "/img/vineyard.jpg" },
] as const;

export const GLOSSARY = [
  { term: "Orange wine", def: "White wine made like red — the skins stay in the tank. Tannic, textured, excellent with the celeriac." },
  { term: "WFR", def: "Wilderness First Responder — 80 hours of remote medicine. Every Trailhead guide carries it." },
  { term: "Moraine", def: "The rubble ridge a glacier leaves behind. Our best blueberries grow on it." },
  { term: "BEO", def: "Banquet Event Order — the single document your celebration lives by. We write it with you, then we hold to it." },
  { term: "Natural ferment", def: "No added yeast. The valley's own microbes do the work — in the bread, the wine, and the hot sauce." },
  { term: "Via ferrata", def: "Iron path — fixed cables on a cliff. We don't run one yet; the ridge asks nicely anyway." },
] as const;

export const JOBS = [
  { title: "Sous chef, Hearth & Vale", dept: "Kitchen", type: "Full-time", season: "Year-round" },
  { title: "Weekend baker", dept: "Meadowlark", type: "Part-time", season: "Year-round" },
  { title: "Trail crew lead", dept: "Trailhead", type: "Seasonal", season: "May–Oct" },
  { title: "House host (evenings)", dept: "The Lodge", type: "Full-time", season: "Year-round" },
] as const;

/* ------------------------------------------------------------------ Local / FAQ */

export const NEIGHBORHOOD = [
  { name: "Vale Hollow village", walk: "9 min", note: "bakery, ironmonger, the last honest phone box", img: "/img/village.jpg", x: 82, y: 30 },
  { name: "The jetty", walk: "4 min", note: "canoes, the 05:45 mist", img: "/img/lake-canoe.jpg", x: 60, y: 12 },
  { name: "Twin Falls", walk: "50 min on foot", note: "spray rainbows at 10:00", img: "/img/trail-ridge.jpg", x: 30, y: 10 },
  { name: "Sugar maples", walk: "25 min", note: "tapped every March", img: "/img/vineyard.jpg", x: 15, y: 62 },
  { name: "The hot spring", walk: "40 min", note: "small, sulphurous, perfect", img: "", x: 88, y: 70 },
  { name: "Old mine viewpoint", walk: "35 min", note: "the whole valley in one look", img: "/img/hero-valley.jpg", x: 45, y: 88 },
] as const;

export const FAQS = [
  { q: "Getting here without a car", a: "The valley shuttle meets the 14:05 at Hollow station four times daily in season. Add the transfer to any booking — $40 round trip." },
  { q: "Cancellation", a: "Free to 72 hours on rooms, 14 days on barn events, weather-hold on all Trailhead trips (we reschedule, you don't pay)." },
  { q: "Dogs", a: "In the Lodge ($25/night, bed and bowls provided), on-lead in The Grove, off-lead in the dog loop. Buns are at your own risk." },
  { q: "Children", a: "Welcome everywhere. Under-6s eat breakfast free; the counter tasting is 12+; the gorge trips are 16+." },
  { q: "Dietary", a: "Tell us 48h ahead and the kitchen will meet it. The vegan tasting is, frankly, a flex." },
  { q: "Tipping", a: "Service included on everything. Nobody here works for tips — that's the point." },
  { q: "Weather policy", a: "Trailhead trips: rain we go, storms we don't. Free move to any date in season. The lake calls off canoe for lightning only." },
  { q: "Accessibility", a: "The Lodge, Meadowlark, and the cellar are step-free with accessible washrooms. The Attic is up steep stairs by design — the Aspen Suite is the move." },
] as const;

export const HOUSE_HOURS = [
  { house: "The Kestrel Lodge", rows: [["Check-in / out", "15:00 / 11:00"], ["Breakfast", "07:30–10:30"], ["Reception", "07:00–22:00"]] },
  { house: "Hearth & Vale", rows: [["Wed–Sat counter", "18:30 (one seating)"], ["Sunday slow lunch", "12:30–15:30"], ["Mon–Tue", "closed — the kitchen forages"]] },
  { house: "The Vessel", rows: [["Thu–Sun tastings", "11:00 / 14:00 / 20:30"], ["Full moon", "by the moon"]] },
  { house: "Meadowlark & Ember", rows: [["Counter & bakery", "07:00–14:00"], ["Ember pies", "18:00–21:00"], ["Wholesale", "Mon 08:00–10:00"]] },
  { house: "Trailhead", rows: [["Daily", "06:30–19:00"], ["Alpine starts", "04:45"]] },
  { house: "The Grove", rows: [["Season", "May–Oct"], ["Quiet hours", "22:30–07:00"]] },
];

/* ------------------------------------------------------------------ Locales (demo) */

export type Locale = "en" | "fr" | "de";

export const LOCALES: { id: Locale; label: string; flag: string }[] = [
  { id: "en", label: "English", flag: "EN" },
  { id: "fr", label: "Français", flag: "FR" },
  { id: "de", label: "Deutsch", flag: "DE" },
];

export const DICT: Record<Locale, Record<string, string>> = {
  en: {
    nav_stay: "Stay", nav_dine: "Dine", nav_drink: "Drink", nav_cafe: "Café",
    nav_adventure: "Adventures", nav_camp: "Camp", nav_celebrate: "Celebrate",
    nav_journal: "Field notes", nav_local: "The valley",
    cta_primary: "Plan your stay", cta_secondary: "Watch the valley film",
    hero_kicker: "Est. 1984 · Pine County", hero_title: "One valley.", hero_title_2: "Six houses.",
    open_now: "Open now", closed: "Closed", portal: "Vale portal", search: "Search",
  },
  fr: {
    nav_stay: "Séjour", nav_dine: "Table", nav_drink: "Cave", nav_cafe: "Café",
    nav_adventure: "Aventures", nav_camp: "Camp", nav_celebrate: "Célébrer",
    nav_journal: "Notes du terrain", nav_local: "La vallée",
    cta_primary: "Planifier le séjour", cta_secondary: "Voir le film de la vallée",
    hero_kicker: "Depuis 1984 · Comté des Pins", hero_title: "Une vallée.", hero_title_2: "Six maisons.",
    open_now: "Ouvert", closed: "Fermé", portal: "Portail Vale", search: "Rechercher",
  },
  de: {
    nav_stay: "Aufenthalt", nav_dine: "Küche", nav_drink: "Keller", nav_cafe: "Café",
    nav_adventure: "Touren", nav_camp: "Zelten", nav_celebrate: "Feiern",
    nav_journal: "Feldnotizen", nav_local: "Das Tal",
    cta_primary: "Aufenthalt planen", cta_secondary: "Tal-Film ansehen",
    hero_kicker: "Seit 1984 · Kiefernkreis", hero_title: "Ein Tal.", hero_title_2: "Sechs Häuser.",
    open_now: "Geöffnet", closed: "Geschlossen", portal: "Vale-Portal", search: "Suchen",
  },
};

/* ------------------------------------------------------------------ Concierge quick prompts */

export const CONCIERGE_PROMPTS = [
  "We're 2 adults + a dog, 3 nights in September — what would you do?",
  "Pair wine with the venison course",
  "Is the Ridge Traverse OK for a nervous beginner?",
  "Plan a 5-day stay with two guided days",
];

export const CONCIERGE_DISCLAIMER =
  "Demo concierge — guidance only, not a contract. A human host confirms everything at the counter.";
