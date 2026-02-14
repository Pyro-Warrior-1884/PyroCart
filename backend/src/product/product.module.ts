import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from '../prisma/prisma.module';
import { OpensearchModule } from '../opensearch/opensearch.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [ProductController, CategoriesController],
  providers: [ProductService, CategoriesService],
  imports: [PrismaModule, OpensearchModule, RedisModule],
})
export class ProductModule {}
