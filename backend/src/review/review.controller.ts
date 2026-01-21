import {
  Controller,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { Throttle } from '@nestjs/throttler';

@Controller('products/:productId/reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Throttle({ default: { limit: 3, ttl: 300 } })
  @Post()
  create(
    @Param('productId') productId: string,
    @Body() dto: CreateReviewDto,
    @User('id') userId: number,
  ) {
    return this.reviewService.create(+productId, userId, dto);
  }

  @Throttle({ default: { limit: 5, ttl: 300 } })
  @Patch(':reviewId')
  update(
    @Param('reviewId') reviewId: string,
    @Body() dto: UpdateReviewDto,
    @User('id') userId: number,
  ) {
    return this.reviewService.update(+reviewId, userId, dto);
  }

  @Throttle({ default: { limit: 3, ttl: 300 } })
  @Delete(':reviewId')
  delete(@Param('reviewId') reviewId: string, @User('id') userId: number) {
    return this.reviewService.delete(+reviewId, userId);
  }
}
