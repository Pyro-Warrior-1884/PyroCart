import { PrismaClient, Prisma } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

type FakeStoreProduct = {
  id: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: {
    rate: number;
    count: number;
  };
};

async function seed() {
  console.log('[SEED] Starting product and category seeding');

  const { data: products } = await axios.get<FakeStoreProduct[]>(
    'https://fakestoreapi.com/products',
  );

  console.log(`[SEED] Fetched ${products.length} products`);

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const exists = await prisma.product.findUnique({
      where: { externalId: product.id },
      select: { id: true },
    });

    await prisma.product.upsert({
      where: { externalId: product.id },

      update: {
        title: product.title,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        ratingAvg: product.rating.rate,
        ratingCount: product.rating.count,
        isActive: true,
        stock: 10,

        category: {
          connectOrCreate: {
            where: { name: product.category },
            create: { name: product.category },
          },
        },

        images: {
          deleteMany: {},
          create: [{ url: product.image }],
        },
      },

      create: {
        externalId: product.id,
        title: product.title,
        description: product.description,
        price: new Prisma.Decimal(product.price),
        ratingAvg: product.rating.rate,
        ratingCount: product.rating.count,
        isActive: true,
        stock: 10,

        category: {
          connectOrCreate: {
            where: { name: product.category },
            create: { name: product.category },
          },
        },

        images: {
          create: [{ url: product.image }],
        },
      },
    });

    if (exists) {
      updated++;
      console.log(`[SEED] Updated product (externalId=${product.id})`);
    } else {
      created++;
    }
  }

  console.log('[SEED] Seeding completed');
  console.log(
    `[SEED] Summary -> Created: ${created}, Updated: ${updated}, Total: ${products.length}`,
  );
}

seed()
  .catch((error) => {
    console.error('[SEED] Seeding failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('[SEED] Prisma disconnected');
  });
