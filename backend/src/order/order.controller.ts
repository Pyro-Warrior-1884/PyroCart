import {
  Controller,
  Post,
  UseGuards,
  Param,
  Get,
  Patch,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { Throttle } from '@nestjs/throttler';
import { Role } from '../auth/roles.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderStatus } from '@prisma/client';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
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

  @Roles(Role.ADMIN)
  @Get('admin/all')
  getAllOrders() {
    return this.orderService.getAllOrders();
  }

  @Roles(Role.ADMIN)
  @Get('admin/:id')
  getOrderById(@Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderById(id);
  }

  @Roles(Role.ADMIN)
  @Patch('admin/:id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: OrderStatus,
  ) {
    return this.orderService.updateOrderStatus(id, status);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Get()
  getMyOrders(@User('id') userId: number) {
    return this.orderService.getUserOrders(userId);
  }

  @Throttle({ default: { limit: 10, ttl: 60 } })
  @Get(':id')
  getMyOrder(
    @Param('id', ParseIntPipe) id: number,
    @User('id') userId: number,
  ) {
    return this.orderService.getUserOrderById(id, userId);
  }
}
