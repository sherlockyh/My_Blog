import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuditAction } from '../../../common/audit/audit.decorator';
import { AuditInterceptor } from '../../../common/audit/audit.interceptor';
import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { RateLimit } from '../../../common/guards/rate-limit.decorator';
import { RateLimitGuard } from '../../../common/guards/rate-limit.guard';
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
  @UseGuards(RateLimitGuard)
  create(@Body() dto: CreateMessageDto) {
    return this.message.create(dto);
  }
}

@UseGuards(JwtGuard)
@UseInterceptors(AuditInterceptor)
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
