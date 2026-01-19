import { Prisma } from '@prisma/client';

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;
