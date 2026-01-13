import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding started...');

  // Fetch 1 product from Fake Store API
  const { data } = await axios.get('https://fakestoreapi.com/products/1');

  await prisma.product.create({
    data: {
      title: data.title,
      description: data.description,
      price: data.price,
      category: data.category,
      imageUrl: data.image, // for now use original URL
      ratingAvg: data.rating.rate,
      ratingCount: data.rating.count,
    },
  })

  console.log('✅ Product seeded');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
