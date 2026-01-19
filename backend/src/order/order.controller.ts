import { Controller, Post, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  checkout(@User('id') userId: number) {
    return this.orderService.checkout(userId);
  }
}
