import { Module } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { RateLimitGuard } from '../../common/guards/rate-limit.guard';
import { MessageAdminController, MessageController } from './controllers/message.controller';
import { MessageRepository } from './repositories/message.repository';
import { MessageService } from './message.service';

@Module({
  imports: [AuditModule],
  controllers: [MessageController, MessageAdminController],
  providers: [MessageRepository, MessageService, RateLimitGuard],
})
export class MessageModule {}
