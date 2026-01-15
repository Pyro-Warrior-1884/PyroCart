import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

/**
 * ESLint-safe type guard for Multer files
 */
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

  async create(dto: CreateProductDto, file?: Express.Multer.File) {
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

    return product;
  }

  findAll() {
    return this.prisma.product.findMany({
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        images: true,
        reviews: true,
      },
    });
  }

  async update(id: number, dto: UpdateProductDto, file?: Express.Multer.File) {
    const { category, ...rest } = dto;

    let objectKey: string | undefined;

    if (isMulterFile(file)) {
      await this.deleteExistingImages(id);

      objectKey = await this.minioService.uploadProductImage(
        file.buffer,
        file.mimetype,
        id,
      );
    }

    return this.prisma.product.update({
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

        ...(objectKey && {
          images: {
            create: [{ url: objectKey }],
          },
        }),
      },
    });
  }

  async remove(id: number) {
    await this.deleteExistingImages(id);

    return this.prisma.product.delete({
      where: { id },
    });
  }

  private async deleteExistingImages(productId: number) {
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
}
