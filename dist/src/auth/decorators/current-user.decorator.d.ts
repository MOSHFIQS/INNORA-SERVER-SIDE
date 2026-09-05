import { UserRole, UserStatus } from '@prisma/client';
export interface AuthUser {
    id: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    firstName: string;
    lastName: string;
}
export declare const CurrentUser: (...dataOrPipes: (keyof AuthUser | import("@nestjs/common").PipeTransform<any, any> | import("@nestjs/common").Type<import("@nestjs/common").PipeTransform<any, any>>)[]) => ParameterDecorator;
