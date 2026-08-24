import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RateLimit } from '../../../common/guards/rate-limit.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
import { AuthService } from '../auth.service';
import { LoginDto } from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @RateLimit({ name: 'auth-login', ttl: 60, limit: 5 })
  @UseGuards(RateLimitGuard)
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }
}
