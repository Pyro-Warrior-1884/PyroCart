import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { MinioService } from './minio/minio.service';
import { MinioModule } from './minio/minio.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    ProductModule,
    MinioModule,
    ReviewModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, MinioService],
})
export class AppModule {}
