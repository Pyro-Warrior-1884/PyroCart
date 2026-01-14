import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateProductDto) {
    const { category, ...rest } = dto;

    return this.prisma.product.create({
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

  async update(id: number, dto: UpdateProductDto) {
    const { category, ...rest } = dto;

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
      },
    });
  }

  remove(id: number) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
