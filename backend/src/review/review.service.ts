import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async create(productId: number, userId: number, dto: CreateReviewDto) {
    return this.prisma.$transaction(async (tx) => {
      const existing = await tx.review.findUnique({
        where: {
          productId_userId: {
            productId,
            userId,
          },
        },
      });

      if (existing) {
        throw new BadRequestException('You have already reviewed this product');
      }

      const review = await tx.review.create({
        data: {
          rating: dto.rating,
          comment: dto.comment,
          productId,
          userId,
        },
      });

      await this.recalculateProductRating(tx, productId);

      return review;
    });
  }

  async update(reviewId: number, userId: number, dto: UpdateReviewDto) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id: reviewId },
      });

      if (!review || review.userId !== userId) {
        throw new BadRequestException('Review not found or forbidden');
      }

      const updated = await tx.review.update({
        where: { id: reviewId },
        data: dto,
      });

      await this.recalculateProductRating(tx, review.productId);

      return updated;
    });
  }

  async delete(reviewId: number, userId: number) {
    return this.prisma.$transaction(async (tx) => {
      const review = await tx.review.findUnique({
        where: { id: reviewId },
      });

      if (!review || review.userId !== userId) {
        throw new BadRequestException('Review not found or forbidden');
      }

      await tx.review.delete({
        where: { id: reviewId },
      });

      await this.recalculateProductRating(tx, review.productId);
    });
  }

  private async recalculateProductRating(
    tx: Prisma.TransactionClient,
    productId: number,
  ) {
    const stats = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await tx.product.update({
      where: { id: productId },
      data: {
        ratingAvg: stats._avg.rating ?? 0,
        ratingCount: stats._count.rating,
      },
    });
  }
}
