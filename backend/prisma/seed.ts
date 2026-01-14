import { PrismaClient } from '@prisma/client';
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
  const { data: products } = await axios.get<FakeStoreProduct[]>(
    'https://fakestoreapi.com/products',
  );

  for (const product of products) {
    await prisma.product.upsert({
      where: { title: product.title },

      update: {
        price: product.price,
        description: product.description,
        ratingAvg: product.rating.rate,
        ratingCount: product.rating.count,

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
        title: product.title,
        price: product.price,
        description: product.description,
        ratingAvg: product.rating.rate,
        ratingCount: product.rating.count,

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
  }
}

seed()
  .catch(() => process.exit(1))
  .finally(async () => {
    await prisma.$disconnect();
  });
