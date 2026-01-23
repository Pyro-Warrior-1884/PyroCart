import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductImage, Category, Review } from '@prisma/client';

type ProductWithRelations = Product & {
  category: Category;
  images: ProductImage[];
  reviews: Review[];
};

type ProductResponse = Omit<ProductWithRelations, 'images'> & {
  images: {
    id: number;
    url: string;
  }[];
};

function isMulterFile(file: unknown): file is Express.Multer.File {
  return (
    typeof file === 'object' &&
    file !== null &&
    'buffer' in file &&
    'mimetype' in file
  );
}

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly minioService: MinioService,
    private readonly redis: RedisService,
  ) {}

  async create(
    dto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponse> {
    const { category, ...rest } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...rest,
        category: {
          connectOrCreate: {
            where: { name: category },
            create: { name: category },
          },
        },
      },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });

    if (isMulterFile(file)) {
      const objectKey = await this.minioService.uploadProductImage(
        file.buffer,
        file.mimetype,
        product.id,
      );

      await this.prisma.productImage.create({
        data: {
          url: objectKey,
          productId: product.id,
        },
      });
    }

    await this.redis.del('products:all');

    return this.mapProduct(product);
  }

  async findAll(): Promise<ProductResponse[]> {
    const cacheKey = 'products:all';

    const cached = await this.redis.getJson<ProductResponse[]>(cacheKey);
    if (cached) {
      return cached;
    }

    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });

    const mapped = await Promise.all(products.map((p) => this.mapProduct(p)));

    await this.redis.setJson(cacheKey, mapped, 60);

    return mapped;
  }

  async findOne(id: number): Promise<ProductResponse | null> {
    const cacheKey = `products:${id}`;

    const cached = await this.redis.getJson<ProductResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });

    if (!product) {
      return null;
    }

    const mapped = await this.mapProduct(product);

    await this.redis.setJson(cacheKey, mapped, 60);

    return mapped;
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponse> {
    const { category, ...rest } = dto;

    if (isMulterFile(file)) {
      await this.deleteExistingImages(id);

      const objectKey = await this.minioService.uploadProductImage(
        file.buffer,
        file.mimetype,
        id,
      );

      await this.prisma.productImage.create({
        data: {
          url: objectKey,
          productId: id,
        },
      });
    }

    await this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        ...(category && {
          category: {
            connectOrCreate: {
              where: { name: category },
              create: { name: category },
            },
          },
        }),
      },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:${id}`);

    const updated = await this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });

    return this.mapProduct(updated);
  }

  async remove(id: number): Promise<Product> {
    await this.deleteExistingImages(id);

    await this.redis.del('products:all');
    await this.redis.del(`products:${id}`);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  private async deleteExistingImages(productId: number): Promise<void> {
    const images = await this.prisma.productImage.findMany({
      where: { productId },
    });

    for (const image of images) {
      await this.minioService.deleteObject(image.url);
    }

    await this.prisma.productImage.deleteMany({
      where: { productId },
    });
  }

  private async mapProduct(
    product: ProductWithRelations,
  ): Promise<ProductResponse> {
    const images = await Promise.all(
      product.images.map(async (img) => ({
        id: img.id,
        url: await this.minioService.getSignedUrl(img.url),
      })),
    );

    return {
      ...product,
      images,
    };
  }
}
