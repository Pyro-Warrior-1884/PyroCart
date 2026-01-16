import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface AuthenticatedUser {
  id: number;
  email: string;
  role: string;
}

export const User = createParamDecorator(
  <K extends keyof AuthenticatedUser = keyof AuthenticatedUser>(
    data: K | undefined,
    ctx: ExecutionContext,
  ): AuthenticatedUser[K] | AuthenticatedUser | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
