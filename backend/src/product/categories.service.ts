import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    console.log(`Categories Listed`);
    return this.prisma.category.findMany({
      include: { products: true },
    });
  }

  findOne(id: number) {
    console.log(`Specific Category Displayed`);
    return this.prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  }
}
