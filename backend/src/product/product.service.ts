import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, Category, Review, ProductImage } from '@prisma/client';
import { OpensearchService } from '../opensearch/opensearch.service';

type ProductWithRelations = Product & {
  category: Category;
  reviews: Review[];
  images: ProductImage[];
};

@Injectable()
export class ProductService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly openSearch: OpensearchService,
  ) {}

  async create(dto: CreateProductDto): Promise<ProductWithRelations> {
    const { category, imageUrl, ...rest } = dto;

    const product = await this.prisma.product.create({
      data: {
        ...rest,
        category: {
          connectOrCreate: {
            where: { name: category },
            create: { name: category },
          },
        },
        ...(imageUrl && {
          images: {
            create: { url: imageUrl },
          },
        }),
      },
      include: {
        category: true,
        reviews: true,
        images: true,
      },
    });

    await this.redis.del('products:all');

    this.openSearch.indexProduct(product);

    return product;
  }

  async findAll(): Promise<ProductWithRelations[]> {
    const cacheKey = 'products:all';

    const cached = await this.redis.getJson<ProductWithRelations[]>(cacheKey);
    if (cached) return cached;

    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        reviews: true,
        images: true,
      },
    });

    await this.redis.setJson(cacheKey, products, 60);
    return products;
  }

  async findOne(id: number): Promise<ProductWithRelations | null> {
    const cacheKey = `products:${id}`;

    const cached = await this.redis.getJson<ProductWithRelations>(cacheKey);
    if (cached) return cached;

    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        reviews: true,
        images: true,
      },
    });

    if (!product) return null;

    await this.redis.setJson(cacheKey, product, 60);
    return product;
  }

  async update(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductWithRelations> {
    const { category, imageUrl, ...rest } = dto;

    const product = await this.prisma.product.update({
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
        ...(imageUrl && {
          images: {
            deleteMany: {},
            create: { url: imageUrl },
          },
        }),
      },
      include: {
        category: true,
        reviews: true,
        images: true,
      },
    });

    await this.redis.del('products:all');
    await this.redis.del(`products:${id}`);

    this.openSearch.indexProduct(product);

    return product;
  }

  async remove(id: number): Promise<Product> {
    await this.redis.del('products:all');
    await this.redis.del(`products:${id}`);

    const product = await this.prisma.product.delete({
      where: { id },
    });

    this.openSearch.deleteProduct(id);

    return product;
  }

  async search(query: string) {
    return this.openSearch.search(query);
  }
}
