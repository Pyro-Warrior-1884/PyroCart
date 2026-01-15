import axios from 'axios';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MinioService } from '../../minio/minio.service';
import { FakeStoreProduct } from './fakestore.types';

export class FakeStoreSeeder {
  constructor(
    private prisma: PrismaService,
    private minio: MinioService,
  ) {}

  async seed() {
    const { data } = await axios.get<FakeStoreProduct[]>(
      'https://fakestoreapi.com/products',
    );

    for (const product of data) {
      const exists = await this.prisma.product.findFirst({
        where: { title: product.title },
      });

      if (exists) continue;

      const imageRes = await axios.get(product.image, {
        responseType: 'arraybuffer',
      });

      const filename = `products/${Date.now()}-${product.id}.jpg`;

      const imageUrl = await this.minio.uploadImage(
        Buffer.from(imageRes.data),
        filename,
        imageRes.headers['content-type'],
      );

      await this.prisma.product.create({
        data: {
          externalId: product.id,
          title: product.title,
          description: product.description,
          price: new Prisma.Decimal(product.price),
          ratingAvg: product.rating.rate,
          ratingCount: product.rating.count,

          category: {
            connectOrCreate: {
              where: { name: product.category },
              create: { name: product.category },
            },
          },

          images: {
            create: [{ url: imageUrl }],
          },
        },
      });
    }
  }
}
