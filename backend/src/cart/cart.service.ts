import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartItem } from '@prisma/client';
import { CartWithItems } from './cart.types';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCart(userId: number): Promise<CartWithItems | null> {
    const cart: CartWithItems | null = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`Cart Displayed`);
    return cart;
  }

  async addToCart(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItem> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const cart = await this.prisma.cart.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });

    const item: CartItem = await this.prisma.cartItem.upsert({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      update: {
        quantity: {
          increment: quantity,
        },
      },
      create: {
        cartId: cart.id,
        productId,
        quantity,
      },
    });

    console.log(`Item Added to Cart`);
    return item;
  }

  async updateItem(
    userId: number,
    productId: number,
    quantity: number,
  ): Promise<CartItem> {
    if (quantity <= 0) {
      throw new BadRequestException('Quantity must be greater than 0');
    }

    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart === null) {
      throw new BadRequestException('Cart not found');
    }

    const item: CartItem = await this.prisma.cartItem.update({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
      data: { quantity },
    });

    console.log(`Item Updated in Cart`);
    return item;
  }

  async removeItem(userId: number, productId: number): Promise<CartItem> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
    });

    if (cart === null) {
      throw new BadRequestException('Cart not found');
    }

    const item: CartItem = await this.prisma.cartItem.delete({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    console.log(`Item Removed from Cart`);
    return item;
  }
}
