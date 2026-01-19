import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { User } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';

@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getMyCart(@User('id') userId: number) {
    return this.cartService.getCart(userId);
  }

  @Post('items')
  add(@User('id') userId: number, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(userId, dto.productId, dto.quantity);
  }

  @Patch('items/:productId')
  update(
    @User('id') userId: number,
    @Param('productId') productId: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateItem(userId, +productId, quantity);
  }

  @Delete('items/:productId')
  remove(@User('id') userId: number, @Param('productId') productId: string) {
    return this.cartService.removeItem(userId, +productId);
  }
}
