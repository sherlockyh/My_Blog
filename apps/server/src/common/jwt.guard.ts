import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

/** 后台接口鉴权：Authorization: Bearer <token> */
@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const header: string | undefined = req.headers['authorization'];
    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing token');
    }
    try {
      req.user = this.jwt.verify(header.slice(7));
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
