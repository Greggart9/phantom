import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Phantom Database Seeding ---');

  // 1. Seed Single Admin User
  const adminEmail = 'admin@phantom.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('PhantomAdmin2026!', salt);

    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        fullName: 'Phantom Atelier Master',
        passwordHash,
        role: Role.ADMIN
      }
    });
    console.log(`[Admin Created]: ${admin.email} (Password: PhantomAdmin2026!)`);
  } else {
    console.log(`[Admin Exists]: ${adminEmail}`);
  }

  // 2. Seed Initial Categories
  const categoriesData = [
    {
      name: 'Artworks',
      slug: 'artworks',
      description: 'Original canvas, textured plaster, and monumental wall pieces.'
    },
    {
      name: 'Leather Objects',
      slug: 'leather-objects',
      description: 'Vegetable-tanned full-grain leather, hand-stitched artifacts.'
    },
    {
      name: 'Sculptures & Objects',
      slug: 'sculptures-and-objects',
      description: 'Hand-cast bronze, carved basalt stone, and smoked stoneware.'
    }
  ];

  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
    categories[cat.slug] = category.id;
    console.log(`[Category]: ${category.name}`);
  }

  // 3. Seed Initial Collections
  const collectionsData = [
    {
      name: 'Obsidian Nocturne',
      slug: 'obsidian-nocturne',
      description: 'Deep midnight tones, charred oak, and matte carbon finishes.',
      coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
    },
    {
      name: 'Raw Terre & Hide',
      slug: 'raw-terre-and-hide',
      description: 'Unbleached canvas, natural tallow-treated hides, and earth pigments.',
      coverImage: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1200&q=80'
    }
  ];

  const collections: Record<string, string> = {};
  for (const col of collectionsData) {
    const collection = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {},
      create: col
    });
    collections[col.slug] = collection.id;
    console.log(`[Collection]: ${collection.name}`);
  }

  // 4. Seed Curated Initial Products (with remaining stock & sold-out test piece)
  const productsData = [
    {
      title: 'Monolith Basalt Vessel',
      slug: 'monolith-basalt-vessel',
      description: 'Hand-carved from a single volcanic basalt deposit. Raw textured exterior with honed interior seal.',
      price: 890.00,
      stockQuantity: 4, // In stock (4 pieces remaining)
      categoryId: categories['sculptures-and-objects']!,
      collectionSlug: 'obsidian-nocturne',
      images: [
        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Saddle Atelier Briefcase No. 04',
      slug: 'saddle-atelier-briefcase-no-04',
      description: 'Full-grain English bridle leather, wax-threaded saddle stitch, patinated solid brass clasp.',
      price: 1450.00,
      stockQuantity: 2, // In stock (Only 2 remaining)
      categoryId: categories['leather-objects']!,
      collectionSlug: 'raw-terre-and-hide',
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
      ]
    },
    {
      title: 'Study in Umber & Silence (Oil & Plaster)',
      slug: 'study-in-umber-and-silence',
      description: 'Original textured plaster, cold wax, and burnt umber mineral pigment on heavy Belgian linen.',
      price: 3200.00,
      stockQuantity: 0, // SOLD OUT TEST PIECE!
      categoryId: categories['artworks']!,
      collectionSlug: 'obsidian-nocturne',
      images: [
        'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=800&q=80'
      ]
    }
  ];

  for (const item of productsData) {
    const { collectionSlug, ...prodData } = item;
    const product = await prisma.product.upsert({
      where: { slug: prodData.slug },
      update: {},
      create: prodData
    });

    if (collections[collectionSlug]) {
      await prisma.productCollection.upsert({
        where: {
          productId_collectionId: {
            productId: product.id,
            collectionId: collections[collectionSlug]!
          }
        },
        update: {},
        create: {
          productId: product.id,
          collectionId: collections[collectionSlug]!
        }
      });
    }

    console.log(`[Product]: ${product.title} (Stock: ${product.stockQuantity})`);
  }

  // 5. Seed Initial Journal Posts
  const journalArticlesData = [
    {
      title: 'The Case for Fewer, Better Things',
      slug: 'the-case-for-fewer-better-things',
      excerpt: 'We ran the numbers on a decade of wear. The expensive coat was the cheap one.',
      content: 'We calculate value at the checkout counter, not across ten winters. A garment bought for little that collapses after six washes costs far more per wear than a piece constructed to survive decades of continuous use.\n\nWhen an object is engineered without planned obsolescence, the relationship between maker and wearer changes. It ceases to be an impulse transaction and becomes an enduring custody.\n\nOur production runs are deliberately restricted. Restraint forces us to inspect every roll of raw wool, test every batch of vegetable tannage, and reject compromise. In a market flooded with disposable novelty, patience remains the rarest luxury.',
      coverImage: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1600&q=85',
      isPublished: true,
      publishedAt: new Date('2026-06-12T10:00:00Z')
    },
    {
      title: 'How to Care for Cashmere',
      slug: 'how-to-care-for-cashmere',
      excerpt: 'Wash it more, dry-clean it less, and stop hanging your knits. A short, opinionated guide.',
      content: 'Harsh chemical solvents strip cashmere fibres of their natural lanolin over time, leaving yarns brittle and lifeless. The secret to long-lasting softness is tepid water and gentle friction. High quality cashmere thrives when washed regularly with a gentle plant-based soap.\n\nSubmerge the knit in lukewarm water with a drop of gentle wool wash. Never wring or twist. Roll it like a sleeping mat in a clean towel to press out moisture, then dry flat away from direct heat. Never hang a knit on a hanger; fold it loosely and store with cedar shavings.',
      coverImage: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1600&q=85',
      isPublished: true,
      publishedAt: new Date('2026-05-14T10:00:00Z')
    },
    {
      title: 'Inside the Mill: Making the Halden',
      slug: 'inside-the-mill-making-the-halden',
      excerpt: 'Three days in Biella, watching two faces of wool become one piece of cloth.',
      content: 'Double-faced wool is two woven fabrics held together by a third, nearly invisible thread. Split it and you have two complete cloths. That is the trick, and it is why the Halden needs no lining — the inside of the coat is simply the other face.\n\nAt the mill in Biella the joining happens on a loom the width of a small car, at a speed that looks like a mistake. Slow is the point. Push the loom and the binding thread shows through on the face.\n\nBecause there is no lining, every seam allowance has to be finished by hand — split, pressed open, and stitched down invisibly through one face only. It adds about ninety minutes per coat. It is the reason the inside looks like the outside.',
      coverImage: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85',
      isPublished: true,
      publishedAt: new Date('2026-05-02T10:00:00Z')
    },
    {
      title: 'The Geometry of Warmth',
      slug: 'the-geometry-of-warmth',
      excerpt: 'Why double-face construction traps more air than lining ever could.',
      content: 'Thermal retention is a function of still air, not weight. By interlacing two independently woven layers with micro-air chambers, heat stays trapped while perspiration evaporates freely. The result is warmth that regulates itself across shifting indoor and outdoor temperatures.\n\nWithout stiff synthetic interlinings, the garment flows naturally with the body\'s movement while holding its sculptural silhouette.',
      coverImage: 'https://images.unsplash.com/photo-1608256246200-53e635b5b65f?auto=format&fit=crop&w=1600&q=85',
      isPublished: true,
      publishedAt: new Date('2026-04-30T10:00:00Z')
    },
    {
      title: 'Notes from the Cutting Table',
      slug: 'notes-from-the-cutting-table',
      excerpt: 'Every roll of cloth has a grain, a memory, and a preferred direction to fall.',
      content: 'No two bolts of wool behave identically. Humidity in the room, the tension of the loom, and the direction of the cut dictate how the finished coat will drape. A master cutter spends hours studying the roll before making the first stroke.\n\nWe still cut individual patterns with heavy shears. The tactile feedback of the steel passing through weave tells the cutter what a digital machine cannot feel.',
      coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1600&q=85',
      isPublished: true,
      publishedAt: new Date('2026-04-18T10:00:00Z')
    },
    {
      title: 'The Highlands in November',
      slug: 'the-highlands-in-november',
      excerpt: 'Visiting the sheep station where our raw fleece begins its journey across the North Sea.',
      content: 'Harsh northern climates produce the densest, most resilient crimp in sheep wool. It is resilient enough to endure storms, yet soft when refined. Each fleece is graded by hand for staple length and clean yield.\n\nThe graziers who tend these flocks have cared for the same pastures for four generations. Their standard is stewardship rather than rapid yield.',
      coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=85',
      isPublished: true,
      publishedAt: new Date('2026-04-02T10:00:00Z')
    }
  ];

  for (const item of journalArticlesData) {
    const post = await prisma.journalPost.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        excerpt: item.excerpt,
        content: item.content,
        coverImage: item.coverImage,
        publishedAt: item.publishedAt,
        isPublished: true
      },
      create: item
    });
    console.log(`[Journal Post]: ${post.title}`);
  }

  console.log('--- Database Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
