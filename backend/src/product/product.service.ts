import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
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
  ) {}

  async create(
    dto: CreateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponse> {
    const { category, ...rest } = dto;
    console.log(`Adding A Product`);
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

    return this.mapProduct(product);
  }

  async findAll(): Promise<ProductResponse[]> {
    console.log(`Displaying All Products`);
    const products = await this.prisma.product.findMany({
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });

    return Promise.all(products.map((p) => this.mapProduct(p)));
  }

  async findOne(id: number): Promise<ProductResponse | null> {
    console.log(`Finding Product ${id}`);
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });

    if (!product) {
      console.log(`Product ${id} Not Exisiting`);
      return null;
    }
    console.log(`Product ${id} Found`);
    return this.mapProduct(product);
  }

  async update(
    id: number,
    dto: UpdateProductDto,
    file?: Express.Multer.File,
  ): Promise<ProductResponse> {
    console.log(`Updating Product ${id}`);
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

    const updatedProduct = await this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
    console.log(`Product ${id} Updated`);
    return this.mapProduct(updatedProduct);
  }

  async remove(id: number): Promise<Product> {
    await this.deleteExistingImages(id);

    console.log(`Product ${id} Deleted`);

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
