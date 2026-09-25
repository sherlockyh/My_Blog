import { Body, Controller, Post } from '@nestjs/common';
import { RateLimit } from '../../../common/guards/rate-limit.decorator';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @RateLimit({ name: 'auth-login', ttl: 60, limit: 5 })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
