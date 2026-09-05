import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { COOKIE_NAMES } from '../cookie.config';
import { JwtPayload } from '../dto/response.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
     constructor(
          private readonly configService: ConfigService,
          private readonly authService: AuthService,
     ) {
          super({
               jwtFromRequest: ExtractJwt.fromExtractors([
                    (req: Request): string | null => {
                         let token: string | null = null;
                         if (req && req.cookies) {
                              token = req.cookies[COOKIE_NAMES.AUTH_TOKEN] ?? null;
                         }
                         return token;
                    },
                    ExtractJwt.fromAuthHeaderAsBearerToken(),
               ]),
               ignoreExpiration: false,
               secretOrKey: configService.get<string>('jwt.secret', 'innora-super-secret-jwt-key-2026'),
          });
     }

     async validate(payload: JwtPayload) {
          if (!payload?.sub) {
               throw new UnauthorizedException('Invalid token: user identifier missing');
          }

          const user = await this.authService.validateUserById(payload.sub);
          if (!user) {
               throw new UnauthorizedException('User no longer exists or is suspended');
          }
          return {
               id: user.id,
               email: user.email,
               role: user.role,
               status: user.status,
               firstName: user.firstName,
               lastName: user.lastName,
          };
     }
}
