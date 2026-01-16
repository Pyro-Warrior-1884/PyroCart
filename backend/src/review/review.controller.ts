import { Controller, Post, Patch, Delete, Param, Body } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('products/:productId/reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  create(@Param('productId') productId: string, @Body() dto: CreateReviewDto) {
    const userId = 1;
    return this.reviewService.create(+productId, userId, dto);
  }

  @Patch(':reviewId')
  update(@Param('reviewId') reviewId: string, @Body() dto: UpdateReviewDto) {
    const userId = 1;
    return this.reviewService.update(+reviewId, userId, dto);
  }

  @Delete(':reviewId')
  delete(@Param('reviewId') reviewId: string) {
    const userId = 1;
    return this.reviewService.delete(+reviewId, userId);
  }
}
