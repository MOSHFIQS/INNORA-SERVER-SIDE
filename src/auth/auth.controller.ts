import { Body, Controller, Get, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import {
     ApiBearerAuth,
     ApiBody,
     ApiOperation,
     ApiResponse,
     ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import {
     authTokenCookieOptions,
     COOKIE_NAMES,
     getCookieOptions,
} from './cookie.config';
import { AuthUser, CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto, UserProfileDto } from './dto/response.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
     private readonly isProd = process.env.NODE_ENV === 'production';

     constructor(private readonly authService: AuthService) {}

     @Public()
     @Post('register')
     @Throttle({ default: { limit: 10, ttl: 60000 } })
     @ApiOperation({
          summary: 'Register a new customer account',
          description: 'Creates a new customer account and sets an HttpOnly auth cookie.',
     })
     @ApiBody({ type: RegisterDto })
     @ApiResponse({ status: 201, description: 'Account created successfully.', type: AuthResponseDto })
     async register(
          @Body() dto: RegisterDto,
          @Req() req: Request,
          @Res({ passthrough: true }) res: Response,
     ) {
          const result = await this.authService.register(dto, this.extractMeta(req));

          res.cookie(
               COOKIE_NAMES.AUTH_TOKEN,
               result.accessToken,
               authTokenCookieOptions(this.isProd),
          );

          return { user: result.user, accessToken: result.accessToken };
     }

     @Public()
     @Post('login')
     @Throttle({ default: { limit: 15, ttl: 60000 } })
     @ApiOperation({
          summary: 'Login with email and password',
          description: 'Authenticates a user and sets an HttpOnly auth cookie.',
     })
     @ApiBody({ type: LoginDto })
     @ApiResponse({ status: 200, description: 'Login successful.', type: AuthResponseDto })
     async login(
          @Body() dto: LoginDto,
          @Req() req: Request,
          @Res({ passthrough: true }) res: Response,
     ) {
          const result = await this.authService.login(dto, this.extractMeta(req));

          res.cookie(
               COOKIE_NAMES.AUTH_TOKEN,
               result.accessToken,
               authTokenCookieOptions(this.isProd),
          );

          return { user: result.user, accessToken: result.accessToken };
     }

     @Post('logout')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Logout current session' })
     async logout(
          @CurrentUser() user: AuthUser,
          @Req() req: Request,
          @Res({ passthrough: true }) res: Response,
     ) {
          const result = await this.authService.logout(user.id, this.extractMeta(req));

          res.clearCookie(COOKIE_NAMES.AUTH_TOKEN, getCookieOptions(this.isProd));

          return result;
     }

     @Get('me')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get current user profile' })
     @ApiResponse({ status: 200, type: UserProfileDto })
     getProfile(@CurrentUser() user: AuthUser) {
          return this.authService.getProfile(user.id);
     }

     @Patch('profile')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Update user profile' })
     updateProfile(
          @CurrentUser() user: AuthUser,
          @Body() dto: UpdateProfileDto,
          @Req() req: Request,
     ) {
          return this.authService.updateProfile(user.id, dto, this.extractMeta(req));
     }

     @Patch('change-password')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Change password' })
     changePassword(
          @CurrentUser() user: AuthUser,
          @Body() dto: ChangePasswordDto,
          @Req() req: Request,
     ) {
          return this.authService.changePassword(user.id, dto, this.extractMeta(req));
     }

     private extractMeta(req: Request) {
          return {
               ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || req.socket?.remoteAddress,
               device: req.get('user-agent'),
               userAgent: req.get('user-agent'),
          };
     }
}
