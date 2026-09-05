import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole, UserStatus } from '@prisma/client';

export interface AuthUser {
     id: string;
     email: string;
     role: UserRole;
     status: UserStatus;
     firstName: string;
     lastName: string;
}

export const CurrentUser = createParamDecorator(
     (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
          const request = ctx.switchToHttp().getRequest();
          const user = request.user;
          return data ? user?.[data] : user;
     },
);
