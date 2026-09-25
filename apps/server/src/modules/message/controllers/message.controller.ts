import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditAction } from '../../../common/audit/audit.decorator';
import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RateLimit } from '../../../common/guards/rate-limit.decorator';
import { MessageService } from '../message.service';
import { CreateMessageDto } from '../dto/message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly message: MessageService) {}

  @Get()
  list() {
    return this.message.list();
  }

  @Post()
  @RateLimit({ name: 'message-create', ttl: 60, limit: 3 })
  create(@Body() dto: CreateMessageDto) {
    return this.message.create(dto);
  }
}

@UseGuards(JwtGuard)
@Controller('admin/messages')
export class MessageAdminController {
  constructor(private readonly message: MessageService) {}

  @Get()
  list(@Query() query: PageQueryDto) {
    return this.message.adminList(query);
  }

  @Delete(':id')
  @AuditAction({ action: 'message.delete', targetType: 'message', targetIdPath: 'params.id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.message.remove(id);
  }
}
