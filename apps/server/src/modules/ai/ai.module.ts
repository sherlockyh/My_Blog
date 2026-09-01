import { Module } from '@nestjs/common';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { SiteConfigModule } from '../site-config/site-config.module';
import { AiController } from './controllers/ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [SiteConfigModule],
  controllers: [AiController],
  providers: [AiService, RateLimitGuard],
})
export class AiModule {}
