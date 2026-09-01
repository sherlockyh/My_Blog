import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RateLimit } from '../../../common/guards/rate-limit.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
import { AiChatDto } from '../dto/ai.dto';
import { AiService } from '../ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('chat')
  @RateLimit({ name: 'ai-chat', ttl: 60, limit: 10 })
  @UseGuards(RateLimitGuard)
  chat(@Body() dto: AiChatDto) {
    return this.ai.chat(dto);
  }
}
