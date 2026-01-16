import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { MinioModule } from './minio/minio.module';
import { ReviewModule } from './review/review.module';
import { AuthModule } from './auth/auth.module';

import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';

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
  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
