import type { ProductItem } from '../context/StoreContext';

export interface ProductSpecification {
  material?: string;
  colourway?: string;
  category?: string;
  madeIn?: string;
  repairs?: string;
  origin?: string;
  weight?: string;
  [key: string]: string | undefined;
}

export interface ProductDetailItem extends ProductItem {
  subtitle?: string;
  rating?: number;
  reviewsCount?: number;
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  materials?: string;
  careInstructions?: string;
  shippingInfo?: string;
  salesCount?: number;
  aboutStory?: string[];
  specifications?: ProductSpecification;
}

const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export const ALL_PRODUCTS: ProductDetailItem[] = [
  // 1. Halden Wool Overcoat (Main Showcase from reference)
  {
    id: 'prod-1',
    name: 'Halden Wool Overcoat',
    slug: 'halden-wool-overcoat',
    price: 680,
    category: 'OUTERWEAR',
    salesCount: 15,
    createdAt: daysAgo(45),
    isSoldOut: false,
    rating: 5.0,
    reviewsCount: 214,
    description: 'A double-faced overcoat with a dropped shoulder and a hand-finished collar.',
    materials: '78% virgin wool, 22% alpaca. Sourced from certified ethical mills in Biella, Italy. Heavyweight double-faced construction with a soft, brushed hand feel.',
    careInstructions: 'Dry clean or spot clean clothes, store folded, never on a hanger, rest between wears. Use a natural bristle garment brush to remove surface dust.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200 within UK or EU. Worldwide express delivery available. Complimentary 30-day returns on all unworn items in original packaging.',
    aboutStory: [
      'The Halden is our longest-running piece and the one we change the least. Double-faced wool is joined by hand along every seam, which is why there is no lining and no bulk — just two faces of cloth that fall in one clean line from the shoulder.',
      'We cut it generously through the body so it clears a jacket, then taper the sleeve so it never swallows the wrist. Wear it open in October, belted in January.'
    ],
    specifications: {
      material: '78% virgin wool, 22% alpaca',
      colourway: 'Undyed Camel',
      category: 'Outerwear',
      madeIn: 'Portugal',
      repairs: 'Free for two years'
    },
    colors: [
      { name: 'Camel', hex: '#cbb396' },
      { name: 'Charcoal', hex: '#3e3e3e' },
      { name: 'Slate Blue', hex: '#586776' }
    ],
    sizes: ['46', '48', '50', '52'],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 2. Merino Chunky Knit
  {
    id: 'prod-2',
    name: 'Merino Chunky Knit',
    slug: 'merino-chunky-knit',
    price: 340,
    category: 'KNITWEAR',
    salesCount: 12,
    createdAt: daysAgo(30),
    isSoldOut: false,
    rating: 4.9,
    reviewsCount: 128,
    description: 'An oversized fisherman rib sweater knitted from 5-gauge pure Australian Merino wool.',
    materials: '100% extra-fine Merino wool. Spun in Piedmont, Italy with low-tension knitting for lofty thermal warmth.',
    careInstructions: 'Hand wash in cool water with wool detergent. Dry flat away from direct heat. Do not hang dry.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200 within UK or EU.',
    colors: [
      { name: 'Oatmeal', hex: '#dfd7cc' },
      { name: 'Deep Olive', hex: '#484d43' },
      { name: 'Pitch Black', hex: '#1c1b1a' }
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 3. Phantom Tote, Saddle
  {
    id: 'prod-3',
    name: 'Phantom Tote, Saddle',
    slug: 'phantom-tote-saddle',
    price: 480,
    category: 'LEATHER',
    salesCount: 10,
    createdAt: daysAgo(60),
    isSoldOut: false,
    rating: 5.0,
    reviewsCount: 89,
    description: 'Full-grain vegetable-tanned bridle leather tote with hand-beveled edges and solid brass hardware.',
    materials: '100% full-grain Tuscan bridle leather, vegetable-tanned using organic chestnut and mimosa bark tannins.',
    careInstructions: 'Condition annually with natural beeswax balm. Keep away from prolonged moisture.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200 within UK or EU.',
    colors: [
      { name: 'Saddle Tan', hex: '#a76a3d' },
      { name: 'Espresso', hex: '#37271e' },
      { name: 'Black', hex: '#11100f' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 4. Kaolin Vase, Tall
  {
    id: 'prod-4',
    name: 'Kaolin Vase, Tall',
    slug: 'kaolin-vase-tall',
    price: 140,
    category: 'OBJECTS',
    salesCount: 9,
    createdAt: daysAgo(40),
    isSoldOut: false,
    rating: 4.8,
    reviewsCount: 46,
    description: 'Hand-thrown stoneware vessel finished with a porous matte kaolin slip glaze.',
    materials: '100% Portuguese kaolin clay stoneware, wood-fired at 1280°C.',
    careInstructions: 'Wipe clean with a damp cotton cloth. Water-tight interior.',
    shippingInfo: 'Shipped in custom shock-absorbing molded fiber packaging.',
    colors: [
      { name: 'Chalk White', hex: '#e8e5de' },
      { name: 'Basalt Grey', hex: '#595754' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 5. Hamo Cropped Trench
  {
    id: 'prod-5',
    name: 'Hamo Cropped Trench',
    slug: 'hamo-cropped-trench',
    price: 520,
    category: 'OUTERWEAR',
    salesCount: 2,
    createdAt: daysAgo(2),
    isSoldOut: true,
    rating: 4.9,
    reviewsCount: 31,
    description: 'A structured cropped trench coat cut from tightly woven water-repellent gabardine cotton.',
    materials: '100% organic cotton gabardine, weather-resistant finish.',
    careInstructions: 'Dry clean only.',
    shippingInfo: 'Complimentary shipping within EU/UK.',
    colors: [
      { name: 'Sand', hex: '#d9cdbd' },
      { name: 'Army Olive', hex: '#4f5043' }
    ],
    sizes: ['46', '48', '50', '52'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 6. Marne Cropped Trench
  {
    id: 'prod-6',
    name: 'Marne Cropped Trench',
    slug: 'marne-cropped-trench',
    price: 520,
    category: 'OUTERWEAR',
    salesCount: 1,
    createdAt: daysAgo(3),
    isSoldOut: true,
    rating: 5.0,
    reviewsCount: 18,
    description: 'Double-breasted short trench silhouette with raglan sleeves and buffalo horn buttons.',
    materials: '100% ventile weatherproof cotton.',
    careInstructions: 'Specialist dry clean.',
    shippingInfo: 'Complimentary shipping over €200.',
    colors: [
      { name: 'Dark Navy', hex: '#1e2430' },
      { name: 'Khaki', hex: '#a69f8c' }
    ],
    sizes: ['48', '50', '52'],
    images: [
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 7. Sundby Cashmere Crew
  {
    id: 'prod-7',
    name: 'Sundby Cashmere Crew',
    slug: 'sundby-cashmere-crew',
    price: 285,
    category: 'KNITWEAR',
    salesCount: 3,
    createdAt: daysAgo(1),
    isSoldOut: false,
    rating: 4.9,
    reviewsCount: 77,
    description: 'Featherweight 12-gauge crewneck spun from Grade-A Mongolian cashmere.',
    materials: '100% Mongolian cashmere. Certified sustainable shearing practices.',
    careInstructions: 'Hand wash cold or gentle wool cycle in laundry bag. Dry flat.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200 within UK or EU.',
    colors: [
      { name: 'Ash Grey', hex: '#8e8e8e' },
      { name: 'Alabaster', hex: '#e3decb' },
      { name: 'Midnight', hex: '#181b22' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 8. Bridle Leather Belt
  {
    id: 'prod-8',
    name: 'Bridle Leather Belt',
    slug: 'bridle-leather-belt',
    price: 145,
    category: 'LEATHER',
    salesCount: 2,
    createdAt: daysAgo(4),
    isSoldOut: false,
    rating: 4.8,
    reviewsCount: 52,
    description: 'Hand-burnished 32mm English bridle leather belt with solid brass buckle.',
    materials: '100% English bridle leather. Solid cast brass hardware.',
    careInstructions: 'Wipe with damp cloth and treat with leather wax.',
    shippingInfo: 'Standard tracked shipping.',
    colors: [
      { name: 'Cognac', hex: '#904e28' },
      { name: 'Black', hex: '#121110' }
    ],
    sizes: ['80', '85', '90', '95'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 9. Quilted Liner Jacket
  {
    id: 'prod-9',
    name: 'Quilted Liner Jacket',
    slug: 'quilted-liner-jacket',
    price: 390,
    category: 'OUTERWEAR',
    salesCount: 4,
    createdAt: daysAgo(20),
    isSoldOut: false,
    rating: 4.9,
    reviewsCount: 64,
    description: 'Onion-quilted thermal liner with recycled down filling and taped seam finishes.',
    materials: 'Shell: 100% recycled nylon ripstop. Insulation: 90/10 recycled goose down.',
    careInstructions: 'Machine wash delicate at 30°C. Tumble dry low with dryer balls.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200 within UK or EU.',
    colors: [
      { name: 'Olive Green', hex: '#4a4d3f' },
      { name: 'Black', hex: '#161514' }
    ],
    sizes: ['46', '48', '50', '52'],
    images: [
      'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 10. Soren Wool Peacoat
  {
    id: 'prod-10',
    name: 'Soren Wool Peacoat',
    slug: 'soren-wool-peacoat',
    price: 640,
    category: 'OUTERWEAR',
    salesCount: 5,
    createdAt: daysAgo(25),
    isSoldOut: false,
    rating: 5.0,
    reviewsCount: 142,
    description: 'Heavy 820gsm melton wool nautical peacoat with high-stance lapels and cupro lining.',
    materials: '100% heavy melton wool, full Japanese cupro lining.',
    careInstructions: 'Dry clean only. Brush lightly after rainfall.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200 within UK or EU.',
    colors: [
      { name: 'Deep Navy', hex: '#1a1f2b' },
      { name: 'Charcoal', hex: '#313131' }
    ],
    sizes: ['46', '48', '50', '52'],
    images: [
      'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 11. Alpaca Rib Cardigan
  {
    id: 'prod-11',
    name: 'Alpaca Rib Cardigan',
    slug: 'alpaca-rib-cardigan',
    price: 395,
    category: 'KNITWEAR',
    salesCount: 3,
    createdAt: daysAgo(18),
    isSoldOut: false,
    rating: 4.8,
    reviewsCount: 93,
    description: 'Shaker rib cardigan with dropped shoulders and natural corozo nut buttoning.',
    materials: '68% baby alpaca, 22% organic wool, 10% recycled polyamide.',
    careInstructions: 'Hand wash in cold water. Lay flat on dry towel.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200.',
    colors: [
      { name: 'Taupe', hex: '#948a80' },
      { name: 'Ivory', hex: '#ede9e3' }
    ],
    sizes: ['S', 'M', 'L'],
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 12. Fine Gauge Mock Neck
  {
    id: 'prod-12',
    name: 'Fine Gauge Mock Neck',
    slug: 'fine-gauge-mock-neck',
    price: 260,
    category: 'KNITWEAR',
    salesCount: 2,
    createdAt: daysAgo(22),
    isSoldOut: false,
    rating: 4.7,
    reviewsCount: 45,
    description: 'Silky 16-gauge merino wool sweater designed for streamlined year-round layering.',
    materials: '100% fine spun Merino wool from New Zealand.',
    careInstructions: 'Hand wash or wool machine wash cold.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200.',
    colors: [
      { name: 'Black', hex: '#121110' },
      { name: 'Dark Melange', hex: '#585858' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 13. Folded Card Holder
  {
    id: 'prod-13',
    name: 'Folded Card Holder',
    slug: 'folded-card-holder',
    price: 120,
    category: 'LEATHER',
    salesCount: 5,
    createdAt: daysAgo(15),
    isSoldOut: false,
    rating: 4.9,
    reviewsCount: 88,
    description: 'Origami-folded single-piece calfskin card case without visible stitching.',
    materials: '100% French box calf leather.',
    careInstructions: 'Condition sparingly with clear cream.',
    shippingInfo: 'Tracked letterbox delivery.',
    colors: [
      { name: 'Espresso', hex: '#37271e' },
      { name: 'Black', hex: '#11100f' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 14. Turned Corozo Tray
  {
    id: 'prod-14',
    name: 'Turned Corozo Tray',
    slug: 'turned-corozo-tray',
    price: 95,
    category: 'OBJECTS',
    salesCount: 1,
    createdAt: daysAgo(19),
    isSoldOut: false,
    rating: 4.8,
    reviewsCount: 22,
    description: 'Desk valance tray turned from sustainable dense tagua palm corozo composite.',
    materials: '100% corozo composite with natural oil finish.',
    careInstructions: 'Wipe with dry microfiber cloth.',
    shippingInfo: 'Standard tracked shipping.',
    colors: [
      { name: 'Smoked Walnut', hex: '#4a3b32' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 15. Field Canvas Parka
  {
    id: 'prod-15',
    name: 'Field Canvas Parka',
    slug: 'field-canvas-parka',
    price: 560,
    category: 'OUTERWEAR',
    salesCount: 2,
    createdAt: daysAgo(28),
    isSoldOut: false,
    rating: 5.0,
    reviewsCount: 39,
    description: 'Heavy duty 14oz dry-waxed cotton canvas parka with storm flap and corduroy collar.',
    materials: '100% dry waxed Scottish cotton canvas.',
    careInstructions: 'Sponge clean with cold water. Do not wash with detergent.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200 within UK or EU.',
    colors: [
      { name: 'Dark Khaki', hex: '#59513e' },
      { name: 'Onyx', hex: '#1c1b1a' }
    ],
    sizes: ['46', '48', '50', '52'],
    images: [
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 16. Smoked Stoneware Bowl
  {
    id: 'prod-16',
    name: 'Smoked Stoneware Bowl',
    slug: 'smoked-stoneware-bowl',
    price: 85,
    category: 'OBJECTS',
    salesCount: 1,
    createdAt: daysAgo(35),
    isSoldOut: false,
    rating: 4.8,
    reviewsCount: 19,
    description: 'Wide low bowl pit-fired using oak shavings to produce organic smoky patterning.',
    materials: '100% stoneware with natural smoke reduction.',
    careInstructions: 'Hand wash only.',
    shippingInfo: 'Shock-resistant packaging.',
    colors: [
      { name: 'Smoked Grey', hex: '#68645e' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 17. Brenna Card Holder
  {
    id: 'rec-brenna-card-holder',
    name: 'Brenna Card Holder',
    slug: 'brenna-card-holder',
    price: 95,
    category: 'LEATHER',
    salesCount: 6,
    createdAt: daysAgo(12),
    isSoldOut: false,
    rating: 4.9,
    reviewsCount: 42,
    description: 'Four-pocket card case cut from bridle leather with beveled and waxed edges.',
    materials: '100% vegetable-tanned bridle leather.',
    careInstructions: 'Wipe with soft cotton cloth. Keep dry.',
    shippingInfo: 'Tracked standard delivery.',
    colors: [
      { name: 'Tan', hex: '#b37748' },
      { name: 'Black', hex: '#161514' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 18. Terra Serving Bowl
  {
    id: 'rec-terra-serving-bowl',
    name: 'Terra Serving Bowl',
    slug: 'terra-serving-bowl',
    price: 88,
    originalPrice: 110,
    badge: 'SALE',
    category: 'OBJECTS',
    salesCount: 4,
    createdAt: daysAgo(25),
    isSoldOut: false,
    rating: 4.8,
    reviewsCount: 37,
    description: 'Generous serving bowl crafted from terracotta with a transparent food-safe interior glaze.',
    materials: '100% terracotta clay with food-safe glaze.',
    careInstructions: 'Hand wash with mild dish soap. Not microwave safe.',
    shippingInfo: 'Custom molded protective packaging.',
    colors: [
      { name: 'Terracotta', hex: '#b86348' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 19. Ash Candle, Cedar & Moss
  {
    id: 'rec-ash-candle-cedar-moss',
    name: 'Ash Candle, Cedar & Moss',
    slug: 'ash-candle-cedar-moss',
    price: 52,
    category: 'OBJECTS',
    salesCount: 8,
    createdAt: daysAgo(18),
    isSoldOut: false,
    rating: 5.0,
    reviewsCount: 65,
    description: 'Soy and rapeseed wax candle poured into a reusable textured ceramic vessel.',
    materials: '100% natural botanical wax, unbleached cotton wick, fragrance oils.',
    careInstructions: 'Trim wick to 5mm before each lighting. Burn for 2-3 hours on first use.',
    shippingInfo: 'Standard tracked shipping.',
    colors: [
      { name: 'Ash Ceramic', hex: '#777470' }
    ],
    sizes: ['280g / 60h'],
    images: [
      'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 20. Fjord Ribbed Turtleneck (You May Also Like reference)
  {
    id: 'prod-fjord-ribbed-turtleneck',
    name: 'Fjord Ribbed Turtleneck',
    slug: 'fjord-ribbed-turtleneck',
    price: 240,
    category: 'KNITWEAR',
    salesCount: 14,
    createdAt: daysAgo(10),
    isSoldOut: false,
    rating: 4.9,
    reviewsCount: 58,
    description: 'Heavy gauge fisherman ribbed turtleneck knitted from high-twist Icelandic wool yarn.',
    materials: '100% Icelandic pure virgin wool. Naturally insulating and water-resistant.',
    careInstructions: 'Hand wash in cold water. Lay flat to dry.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200.',
    aboutStory: [
      'The Fjord Turtleneck was developed to endure harsh Atlantic coastal winters while retaining a soft, breathable hand feel against the neck.',
      'Knitted on traditional flatbed machines with a high-standing double collar that never sags with wear.'
    ],
    specifications: {
      material: '100% Icelandic pure virgin wool',
      colourway: 'Charcoal Rib',
      category: 'Knitwear',
      madeIn: 'Portugal',
      repairs: 'Free for two years'
    },
    colors: [
      { name: 'Charcoal', hex: '#343434' },
      { name: 'Oatmeal', hex: '#dfd7cc' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 21. Loden Merino Cardigan (You May Also Like reference)
  {
    id: 'prod-loden-merino-cardigan',
    name: 'Loden Merino Cardigan',
    slug: 'loden-merino-cardigan',
    price: 310,
    badge: 'LIMITED',
    category: 'KNITWEAR',
    salesCount: 19,
    createdAt: daysAgo(5),
    isSoldOut: false,
    rating: 5.0,
    reviewsCount: 72,
    description: 'A boxy raglan cardigan spun from 7-gauge loden green merino wool with carved corozo buttons.',
    materials: '100% superfine Merino wool with natural corozo nut buttons.',
    careInstructions: 'Dry clean or delicate hand wash cold.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200.',
    aboutStory: [
      'Spun in small seasonal batches from regenerative farms, the Loden Cardigan features a compact milano knit border and deep patch pockets.',
      'The rich herbal green tone is achieved using low-impact certified botanical dyes.'
    ],
    specifications: {
      material: '100% superfine Merino wool',
      colourway: 'Loden Green',
      category: 'Knitwear',
      madeIn: 'Portugal',
      repairs: 'Free for two years'
    },
    colors: [
      { name: 'Loden Green', hex: '#4f5e3e' }
    ],
    sizes: ['46', '48', '50', '52'],
    images: [
      'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 22. Otto Structured Tote (You May Also Like reference)
  {
    id: 'prod-otto-structured-tote',
    name: 'Otto Structured Tote',
    slug: 'otto-structured-tote',
    price: 460,
    badge: 'BESTSELLER',
    category: 'LEATHER',
    salesCount: 28,
    createdAt: daysAgo(50),
    isSoldOut: false,
    rating: 5.0,
    reviewsCount: 114,
    description: 'Minimalist box-silhouette open tote bag crafted from heavy vegetable-tanned harness leather.',
    materials: '100% Tuscan vegetable-tanned saddle leather, raw edge construction.',
    careInstructions: 'Treat periodically with natural leather cream. Protect from standing water.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200.',
    aboutStory: [
      'The Otto Tote is built from unlined 3.5mm thick saddle leather that self-stands without internal stiffeners.',
      'Each piece is saddle-stitched by hand with waxed linen thread to ensure it will outlive decades of daily use.'
    ],
    specifications: {
      material: '100% Tuscan saddle leather',
      colourway: 'Chestnut Brown',
      category: 'Leather Goods',
      madeIn: 'Portugal',
      repairs: 'Free for two years'
    },
    colors: [
      { name: 'Chestnut', hex: '#7a4a2b' },
      { name: 'Black', hex: '#11100f' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1200&q=85'
    ]
  },
  // 23. Pell Crossbody (You May Also Like reference)
  {
    id: 'prod-pell-crossbody',
    name: 'Pell Crossbody',
    slug: 'pell-crossbody',
    price: 320,
    badge: 'NEW',
    category: 'LEATHER',
    salesCount: 11,
    createdAt: daysAgo(2),
    isSoldOut: false,
    rating: 4.9,
    reviewsCount: 39,
    description: 'Compact square crossbody bag with magnetic flap closure and adjustable webbing shoulder strap.',
    materials: '100% supple calfskin leather with brushed nickel hardware.',
    careInstructions: 'Wipe clean with a dry microfiber cloth.',
    shippingInfo: 'Free carbon-neutral delivery on orders above €200.',
    aboutStory: [
      'Designed for streamlined day-to-night carry. Fits phone, passport, card case, and keys comfortably.',
      'Constructed with rounded corners and an interior slip pocket stamped with individual serial numbers.'
    ],
    specifications: {
      material: '100% French box calfskin',
      colourway: 'Noir Black',
      category: 'Leather Goods',
      madeIn: 'Portugal',
      repairs: 'Free for two years'
    },
    colors: [
      { name: 'Noir Black', hex: '#11100f' }
    ],
    sizes: ['ONE SIZE'],
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1200&q=85',
      'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1200&q=85'
    ]
  }
];

export const YOU_MAY_ALSO_LIKE_PRODUCTS: ProductDetailItem[] = [
  ALL_PRODUCTS.find((p) => p.slug === 'fjord-ribbed-turtleneck')!,
  ALL_PRODUCTS.find((p) => p.slug === 'loden-merino-cardigan')!,
  ALL_PRODUCTS.find((p) => p.slug === 'otto-structured-tote')!,
  ALL_PRODUCTS.find((p) => p.slug === 'pell-crossbody')!
].filter(Boolean);

export function getProductBySlug(slug: string): ProductDetailItem | undefined {
  return ALL_PRODUCTS.find((p) => p.slug === slug || p.id === slug);
}

// Dynamic fallback helper: generates natural story paragraphs for ANY product
export function getProductStory(product: ProductDetailItem | any): string[] {
  if (product.aboutStory && product.aboutStory.length > 0) {
    return product.aboutStory;
  }
  if (product.storyParagraphs && Array.isArray(product.storyParagraphs) && product.storyParagraphs.length > 0) {
    return product.storyParagraphs;
  }
  const displayName = product.name || product.title || 'Piece';
  return [
    `The ${displayName} is one of our defining Phantom designs, developed with uncompromising attention to form, proportion, and tactile comfort. Every seam is finished by hand using organic natural fibers that drape effortlessly.`,
    `Engineered for versatile everyday wear and longevity. Finished with custom detailing and sourced through responsible, traceable production partners in Europe.`
  ];
}

// Dynamic fallback helper: generates key-value specifications for ANY product
export function getProductSpecifications(product: ProductDetailItem | any): [string, string][] {
  if (product.specifications) {
    if (Array.isArray(product.specifications) && product.specifications.length > 0) {
      return product.specifications.map((s: any) => [
        String(s.label || s.key || '').toUpperCase(),
        String(s.value || '')
      ]);
    }
    if (typeof product.specifications === 'object') {
      const list: [string, string][] = [];
      if (product.specifications.material) list.push(['MATERIAL', product.specifications.material]);
      if (product.specifications.colourway) list.push(['COLOURWAY', product.specifications.colourway]);
      if (product.specifications.category) list.push(['CATEGORY', product.specifications.category]);
      if (product.specifications.madeIn) list.push(['MADE IN', product.specifications.madeIn]);
      if (product.specifications.repairs) list.push(['REPAIRS', product.specifications.repairs]);
      // Also include any extra custom properties dynamically
      for (const [key, value] of Object.entries(product.specifications)) {
        if (!['material', 'colourway', 'category', 'madeIn', 'repairs'].includes(key) && value) {
          list.push([key.toUpperCase().replace(/_/g, ' '), String(value)]);
        }
      }
      if (list.length > 0) return list;
    }
  }

  const rawCat = typeof product.category === 'object' && product.category !== null
    ? (product.category.name || 'Outwear')
    : (typeof product.category === 'string' && product.category ? product.category : 'Outwear');

  const firstColor = Array.isArray(product.colors) && product.colors.length > 0
    ? (typeof product.colors[0] === 'string' ? product.colors[0] : product.colors[0]?.name)
    : 'Undyed Camel';

  // Graceful dynamic defaults based on product properties
  return [
    ['MATERIAL', product.materials || '78% virgin wool, 22% alpaca'],
    ['COLOURWAY', firstColor || 'Undyed Camel'],
    ['CATEGORY', rawCat.charAt(0).toUpperCase() + rawCat.slice(1).toLowerCase()],
    ['MADE IN', 'Portugal'],
    ['REPAIRS', 'Free for two years']
  ];
}
