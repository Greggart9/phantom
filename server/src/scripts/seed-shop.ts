import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Shop Products Seeding ---');

  // 1. Ensure Categories
  const categoriesData = [
    { name: 'Outerwear', slug: 'outerwear', description: 'Coats, trenches, shells and cold-weather liners.' },
    { name: 'Knitwear', slug: 'knitwear', description: 'Heavyweight wool, cashmere crews, and cardigans.' },
    { name: 'Leather', slug: 'leather', description: 'Vegetable-tanned totes, briefcases, and small goods.' },
    { name: 'Objects', slug: 'objects', description: 'Stoneware ceramics, trays, and sculptural table pieces.' }
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat
    });
    catMap[cat.slug] = record.id;
    console.log(`[Category] ${record.name} (${record.slug})`);
  }

  // 2. Ensure test admin/customer user for orders
  let testUser = await prisma.user.findFirst();
  if (!testUser) {
    testUser = await prisma.user.create({
      data: {
        email: 'customer@phantom.com',
        fullName: 'Marguerite Vaillant',
        passwordHash: 'dummyhash',
        country: 'COPENHAGEN',
        role: Role.CUSTOMER
      }
    });
  }

  // Helper date calculation
  const daysAgo = (d: number) => new Date(Date.now() - d * 24 * 60 * 60 * 1000);

  // 3. The 16 Curated Products
  const products = [
    // --- TOP 4 BESTSELLERS (Row 1) ---
    {
      title: 'Halden Wool Overcoat',
      slug: 'halden-wool-overcoat',
      description: 'Single-breasted coat tailored from double-faced raw virgin wool. Unlined body with bound seams.',
      price: 680,
      stockQuantity: 6,
      categorySlug: 'outerwear',
      createdAt: daysAgo(45),
      salesCount: 15,
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Merino Chunky Knit',
      slug: 'merino-chunky-knit',
      description: 'Hand-linked fisherman rib knit from 5-gauge spun Australian merino wool. Ribbed collar and cuffs.',
      price: 340,
      stockQuantity: 8,
      categorySlug: 'knitwear',
      createdAt: daysAgo(30),
      salesCount: 12,
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Phantom Tote, Saddle',
      slug: 'phantom-tote-saddle',
      description: 'Open-top carryall fashioned from full-grain Tuscan vegetable-tanned leather with hand-burnished edges.',
      price: 480,
      stockQuantity: 7,
      categorySlug: 'leather',
      createdAt: daysAgo(60),
      salesCount: 10,
      images: [
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Kaolin Vase, Tall',
      slug: 'kaolin-vase-tall',
      description: 'Wheel-thrown raw porcelain vessel left unglazed on the exterior with mineral-washed interior seal.',
      price: 140,
      stockQuantity: 4,
      categorySlug: 'objects',
      createdAt: daysAgo(40),
      salesCount: 9,
      images: [
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=85'
      ]
    },

    // --- RECENT PIECES (added within last 7 days -> NEW tag) ---
    {
      title: 'Hamo Cropped Trench',
      slug: 'hamo-cropped-trench',
      description: 'Water-repellent storm cloth trench cropped at hip. Storm flap, horn buttons, belted waist.',
      price: 520,
      stockQuantity: 0, // SOLD OUT
      categorySlug: 'outerwear',
      createdAt: daysAgo(2), // 2 days ago -> NEW
      salesCount: 2,
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Marne Cropped Trench',
      slug: 'marne-cropped-trench',
      description: 'Double-breasted short trench cut from dense Italian cotton gabardine. Unstructured shoulder.',
      price: 520,
      stockQuantity: 0, // SOLD OUT
      categorySlug: 'outerwear',
      createdAt: daysAgo(3), // 3 days ago -> NEW
      salesCount: 1,
      images: [
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Sundby Cashmere Crew',
      slug: 'sundby-cashmere-crew',
      description: 'Two-ply Mongolian cashmere sweater knit to an easy relaxed fit with subtle rolled collar edges.',
      price: 285,
      stockQuantity: 5,
      categorySlug: 'knitwear',
      createdAt: daysAgo(1), // 1 day ago -> NEW
      salesCount: 3,
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Bridle Leather Belt',
      slug: 'bridle-leather-belt',
      description: 'Cut from 10oz English bridle butt with solid sand-cast nickel buckle and hand-waxed edges.',
      price: 145,
      stockQuantity: 11,
      categorySlug: 'leather',
      createdAt: daysAgo(4), // 4 days ago -> NEW
      salesCount: 2,
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85'
      ]
    },

    // --- REMAINING PIECES (added > 7 days ago -> No NEW tag) ---
    {
      title: 'Quilted Liner Jacket',
      slug: 'quilted-liner-jacket',
      description: 'Featherweight recycled nylon shell insulated with washed wool batting. Snap closure and patch pockets.',
      price: 390,
      stockQuantity: 9,
      categorySlug: 'outerwear',
      createdAt: daysAgo(20),
      salesCount: 4,
      images: [
        'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Soren Wool Peacoat',
      slug: 'soren-wool-peacoat',
      description: 'Heavy Melton wool peacoat featuring oversized notched lapels and hand-carved horn anchor buttons.',
      price: 640,
      stockQuantity: 4,
      categorySlug: 'outerwear',
      createdAt: daysAgo(25),
      salesCount: 5,
      images: [
        'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Alpaca Rib Cardigan',
      slug: 'alpaca-rib-cardigan',
      description: 'Chunky button-front knit spun from undyed Peruvian baby alpaca yarn. Corozo nut buttons.',
      price: 395,
      stockQuantity: 6,
      categorySlug: 'knitwear',
      createdAt: daysAgo(18),
      salesCount: 3,
      images: [
        'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Fine Gauge Mock Neck',
      slug: 'fine-gauge-mock-neck',
      description: '16-gauge combed extrafine merino wool seamless sweater. Exceptionally soft and layerable.',
      price: 260,
      stockQuantity: 10,
      categorySlug: 'knitwear',
      createdAt: daysAgo(22),
      salesCount: 2,
      images: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1000&q=85'
      ]
    },

    // --- PIECES 13 TO 16 (Revealed upon clicking LOAD MORE) ---
    {
      title: 'Folded Card Holder',
      slug: 'folded-card-holder',
      description: 'Origami fold construction from a single piece of wax-tanned French calfskin. No stitching.',
      price: 120,
      stockQuantity: 14,
      categorySlug: 'leather',
      createdAt: daysAgo(15),
      salesCount: 5,
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Turned Corozo Tray',
      slug: 'turned-corozo-tray',
      description: 'Hand-lathed catchall tray carved from salvaged walnut with natural organic beeswax finish.',
      price: 95,
      stockQuantity: 8,
      categorySlug: 'objects',
      createdAt: daysAgo(19),
      salesCount: 1,
      images: [
        'https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Field Canvas Parka',
      slug: 'field-canvas-parka',
      description: 'Heavy 14oz dry-wax cotton canvas jacket with detachable wool storm hood and brass snaps.',
      price: 560,
      stockQuantity: 3,
      categorySlug: 'outerwear',
      createdAt: daysAgo(28),
      salesCount: 2,
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85'
      ]
    },
    {
      title: 'Smoked Stoneware Bowl',
      slug: 'smoked-stoneware-bowl',
      description: 'Pit-fired stoneware bowl exhibiting unique charcoal oxidation markings. Food and heat safe.',
      price: 85,
      stockQuantity: 7,
      categorySlug: 'objects',
      createdAt: daysAgo(35),
      salesCount: 1,
      images: [
        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?auto=format&fit=crop&w=1000&q=85',
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1000&q=85'
      ]
    }
  ];

  for (const p of products) {
    const categoryId = catMap[p.categorySlug]!;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        price: p.price,
        description: p.description,
        stockQuantity: p.stockQuantity,
        images: p.images,
        categoryId,
        createdAt: p.createdAt
      },
      create: {
        title: p.title,
        slug: p.slug,
        price: p.price,
        description: p.description,
        stockQuantity: p.stockQuantity,
        images: p.images,
        categoryId,
        createdAt: p.createdAt
      }
    });

    // Create dummy order items if salesCount > 0 to establish bestsellers
    const existingOrdersCount = await prisma.orderItem.count({ where: { productId: product.id } });
    if (existingOrdersCount < p.salesCount && testUser) {
      // Create an order with orderItems
      const order = await prisma.order.create({
        data: {
          orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          userId: testUser.id,
          totalAmount: p.price * p.salesCount,
          shippingAddress: { country: 'Copenhagen', city: 'Copenhagen' }
        }
      });
      for (let i = existingOrdersCount; i < p.salesCount; i++) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            productId: product.id,
            quantity: 1,
            unitPrice: p.price
          }
        });
      }
    }

    console.log(`[Product Seeding] ${product.title} (Stock: ${product.stockQuantity}, Category: ${p.categorySlug})`);
  }

  console.log('--- Shop Products Seeding Complete ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
