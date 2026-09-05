import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { AuthUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserProfileDto } from './dto/response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private readonly authService;
    private readonly isProd;
    constructor(authService: AuthService);
    register(dto: RegisterDto, req: Request, res: Response): Promise<{
        user: UserProfileDto;
        accessToken: string;
    }>;
    login(dto: LoginDto, req: Request, res: Response): Promise<{
        user: UserProfileDto;
        accessToken: string;
    }>;
    logout(user: AuthUser, req: Request, res: Response): Promise<{
        message: string;
    }>;
    getProfile(user: AuthUser): Promise<UserProfileDto>;
    updateProfile(user: AuthUser, dto: UpdateProfileDto, req: Request): Promise<UserProfileDto>;
    changePassword(user: AuthUser, dto: ChangePasswordDto, req: Request): Promise<{
        message: string;
    }>;
    private extractMeta;
}
