import { Module } from '@nestjs/common';
import { MessageAdminController, MessageController } from './message.controller';
import { MessageService } from './message.service';

@Module({
  controllers: [MessageController, MessageAdminController],
  providers: [MessageService],
})
export class MessageModule {}
