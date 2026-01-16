import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MinioModule } from '../minio/minio.module';

@Module({
  controllers: [ProductController, CategoriesController],
  providers: [ProductService, CategoriesService],
  imports: [PrismaModule, MinioModule],
})
export class ProductModule {}
