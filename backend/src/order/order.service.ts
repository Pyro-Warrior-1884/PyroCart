import {
  Injectable,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartService } from '../cart/cart.service';
import { CartWithItems } from '../cart/cart.types';
import { Order, OrderStatus } from '@prisma/client';
import { RedisService } from '../redis/redis.service';

const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['PAID', 'CANCELLED'],
  PAID: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};

@Injectable()
export class OrderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cartService: CartService,
    private readonly redis: RedisService,
  ) {}

  async checkout(userId: number): Promise<Order> {
    const lockKey = `checkout:lock:user:${userId}`;

    const acquired = await this.redis.acquireLock(lockKey, 30);

    if (!acquired) {
      throw new ConflictException('Checkout already in progress. Please wait.');
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const cart: CartWithItems | null =
          await this.cartService.getCart(userId);

        if (!cart || cart.items.length === 0) {
          throw new BadRequestException('Cart is empty');
        }

        let total = 0;

        for (const item of cart.items) {
          if (item.product.stock < item.quantity) {
            throw new BadRequestException(
              `Insufficient stock for ${item.product.title}`,
            );
          }

          total += Number(item.product.price) * item.quantity;
        }

        const order = await tx.order.create({
          data: {
            userId,
            total,
            items: {
              create: cart.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                price: Number(item.product.price),
              })),
            },
          },
        });

        for (const item of cart.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        await tx.cartItem.deleteMany({
          where: { cartId: cart.id },
        });

        return order;
      });
    } finally {
      await this.redis.releaseLock(lockKey);
    }
  }

  async getUserOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserOrderById(orderId: number, userId: number) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return order;
  }

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getOrderById(orderId: number) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: true,
      },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    return order;
  }

  async updateOrderStatus(orderId: number, status: OrderStatus) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new BadRequestException('Order not found');
    }

    const allowedNextStates = ORDER_STATUS_FLOW[order.status];

    if (!allowedNextStates.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${order.status} to ${status}`,
      );
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}
