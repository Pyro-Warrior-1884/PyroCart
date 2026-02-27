import { Controller, Post, UseGuards, Param, Get } from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/decorators/user.decorator';
import { Throttle } from '@nestjs/throttler';
import { Role } from '../auth/roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Throttle({ default: { limit: 3, ttl: 300 } })
  @Post('checkout')
  checkout(@User('id') userId: number) {
    return this.orderService.checkout(userId);
  }

  @Roles(Role.ADMIN)
  @Get('analytics')
  getCheckoutAnalytics() {
    return this.orderService.getCheckoutAnalytics();
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Get()
  getMyOrders(@User('id') userId: number) {
    return this.orderService.getUserOrders(userId);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Get(':id')
  getMyOrder(@Param('id') id: string, @User('id') userId: number) {
    return this.orderService.getUserOrderById(+id, userId);
  }
}
