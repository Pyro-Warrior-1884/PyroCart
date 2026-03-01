import { PrismaClient, Prisma } from '@prisma/client';
import axios from 'axios';
import { Client as OpenSearchClient } from '@opensearch-project/opensearch';

const prisma = new PrismaClient();

const opensearch = new OpenSearchClient({
  node: process.env.OPENSEARCH_URL || 'http://opensearch:9200',
});

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
  console.log('[SEED] Starting product seeding');

  const { data: products } = await axios.get<FakeStoreProduct[]>(
    'https://fakestoreapi.com/products',
  );

  const existing = await prisma.product.findMany({
    select: { externalId: true },
  });

  const existingIds = new Set(existing.map((p) => p.externalId));

  let created = 0;

  for (const product of products) {
    if (existingIds.has(product.id)) {
      continue;
    }

    const dbProduct = await prisma.product.create({
      data: {
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
      include: {
        category: true,
      },
    });

    await opensearch.index({
      index: 'products',
      id: dbProduct.id.toString(),
      refresh: true,
      body: {
        id: dbProduct.id,
        name: dbProduct.title,
        description: dbProduct.description ?? '',
        price: Number(dbProduct.price),
        category: dbProduct.category?.name ?? '',
        createdAt: dbProduct.createdAt,
      },
    });

    created++;
    console.log(`[SEED] Created ${created}`);
  }

  console.log(`[SEED] Completed. Added ${created} new products`);
}

seed()
  .catch((error) => {
    console.error('[SEED] Failed', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('[SEED] Prisma disconnected');
  });
