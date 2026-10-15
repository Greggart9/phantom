export interface JournalSectionBlock {
  heading: string;
  paragraphs: string[];
}

export interface JournalArticleItem {
  id: string;
  category: string;
  readTime: string;
  date?: string;
  author?: string;
  title: string;
  excerpt: string;
  imageUrl: string;
  slug: string;
  contentSections?: JournalSectionBlock[];
}

export const JOURNAL_ARTICLES: JournalArticleItem[] = [
  {
    id: 'journal-1',
    category: 'PHILOSOPHY',
    date: 'JUNE 12, 2026',
    readTime: '6 MIN READ',
    author: 'THOMAS VANDENBERG',
    title: 'The Case for Fewer, Better Things',
    excerpt:
      'We ran the numbers on a decade of wear. The expensive coat was the cheap one.',
    imageUrl:
      'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1600&q=85',
    slug: 'the-case-for-fewer-better-things',
    contentSections: [
      {
        heading: 'The illusion of affordability',
        paragraphs: [
          'We calculate value at the checkout counter, not across ten winters. A garment bought for little that collapses after six washes costs far more per wear than a piece constructed to survive decades of continuous use.',
          'When an object is engineered without planned obsolescence, the relationship between maker and wearer changes. It ceases to be an impulse transaction and becomes an enduring custody.'
        ]
      },
      {
        heading: 'Friction as an asset',
        paragraphs: [
          'Our production runs are deliberately restricted. Restraint forces us to inspect every roll of raw wool, test every batch of vegetable tannage, and reject compromise.',
          'In a market flooded with disposable novelty, patience remains the rarest luxury.'
        ]
      }
    ]
  },
  {
    id: 'journal-2',
    category: 'CRAFT',
    date: 'MAY 2, 2026',
    readTime: '8 MIN READ',
    author: 'INES KARLSSON',
    title: 'Inside the Mill: Making the Halden',
    excerpt:
      'Three days in Biella, watching two faces of wool become one piece of cloth.',
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85',
    slug: 'inside-the-mill-making-the-halden',
    contentSections: [
      {
        heading: 'Two faces, one cloth',
        paragraphs: [
          'Double-faced wool is two woven fabrics held together by a third, nearly invisible thread. Split it and you have two complete cloths. That is the trick, and it is why the Halden needs no lining — the inside of the coat is simply the other face.',
          'At the mill in Biella the joining happens on a loom the width of a small car, at a speed that looks like a mistake. Slow is the point. Push the loom and the binding thread shows through on the face.'
        ]
      },
      {
        heading: 'The seams nobody sees',
        paragraphs: [
          'Because there is no lining, every seam allowance has to be finished by hand — split, pressed open, and stitched down invisibly through one face only. It adds about ninety minutes per coat. It is the reason the inside looks like the outside.',
          'When you run your hand along the inner shoulder of the finished coat, there is no ridge, no taped binding, and no synthetic acetate cold against the collarbone. Only raw, structured warmth.'
        ]
      }
    ]
  },
  {
    id: 'journal-3',
    category: 'CARE',
    date: 'MAY 14, 2026',
    readTime: '4 MIN READ',
    author: 'ASTRID LIND',
    title: 'How to Care for Cashmere',
    excerpt:
      'Wash it more, dry-clean it less, and stop hanging your knits. A short, opinionated guide.',
    imageUrl:
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=85',
    slug: 'how-to-care-for-cashmere',
    contentSections: [
      {
        heading: 'The myth of dry cleaning',
        paragraphs: [
          'Harsh chemical solvents strip cashmere fibres of their natural lanolin over time, leaving yarns brittle and lifeless. The secret to long-lasting softness is tepid water and gentle friction.',
          'High quality cashmere thrives when washed regularly with a gentle plant-based soap.'
        ]
      },
      {
        heading: 'The basin and the towel',
        paragraphs: [
          'Submerge the knit in lukewarm water with a drop of gentle wool wash. Never wring or twist. Roll it like a sleeping mat in a clean towel to press out moisture, then dry flat away from direct heat.',
          'Never hang a knit on a hanger; fold it loosely and store with cedar shavings.'
        ]
      }
    ]
  },
  {
    id: 'journal-4',
    category: 'MATERIALS',
    date: 'APRIL 30, 2026',
    readTime: '5 MIN READ',
    author: 'MARCUS CHEN',
    title: 'The Geometry of Warmth',
    excerpt:
      'Why double-face construction traps more air than lining ever could.',
    imageUrl:
      'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1600&q=85',
    slug: 'the-geometry-of-warmth',
    contentSections: [
      {
        heading: 'Micro-climates within the weave',
        paragraphs: [
          'Thermal retention is a function of still air, not weight. By interlacing two independently woven layers with micro-air chambers, heat stays trapped while perspiration evaporates freely.',
          'The result is warmth that regulates itself across shifting indoor and outdoor temperatures.'
        ]
      },
      {
        heading: 'Weightless structure',
        paragraphs: [
          'Without stiff synthetic interlinings, the garment flows naturally with the body\'s movement while holding its sculptural silhouette.'
        ]
      }
    ]
  },
  {
    id: 'journal-5',
    category: 'PHANTOM',
    date: 'APRIL 18, 2026',
    readTime: '7 MIN READ',
    author: 'INES KARLSSON',
    title: 'Notes from the Cutting Table',
    excerpt:
      'Every roll of cloth has a grain, a memory, and a preferred direction to fall.',
    imageUrl:
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85',
    slug: 'notes-from-the-cutting-table',
    contentSections: [
      {
        heading: 'Listening to the grain',
        paragraphs: [
          'No two bolts of wool behave identically. Humidity in the room, the tension of the loom, and the direction of the cut dictate how the finished coat will drape.',
          'A master cutter spends hours studying the roll before making the first stroke.'
        ]
      },
      {
        heading: 'The human eye vs the laser',
        paragraphs: [
          'We still cut individual patterns with heavy shears. The tactile feedback of the steel passing through weave tells the cutter what a digital machine cannot feel.'
        ]
      }
    ]
  },
  {
    id: 'journal-6',
    category: 'ORIGIN',
    date: 'APRIL 02, 2026',
    readTime: '6 MIN READ',
    author: 'THOMAS VANDENBERG',
    title: 'The Highlands in November',
    excerpt:
      'Visiting the sheep station where our raw fleece begins its journey across the North Sea.',
    imageUrl:
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
    slug: 'the-highlands-in-november',
    contentSections: [
      {
        heading: 'Wind, rain, and micron count',
        paragraphs: [
          'Harsh northern climates produce the densest, most resilient crimp in sheep wool. It is resilient enough to endure storms, yet soft when refined.',
          'Each fleece is graded by hand for staple length and clean yield.'
        ]
      },
      {
        heading: 'Generations of stewardship',
        paragraphs: [
          'The graziers who tend these flocks have cared for the same pastures for four generations. Their standard is stewardship rather than rapid yield.'
        ]
      }
    ]
  }
];
