import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/jwt.guard';
import { MessageService } from './message.service';
import { CreateMessageDto } from './message.dto';

@Controller('messages')
export class MessageController {
  constructor(private readonly message: MessageService) {}

  @Get()
  list() {
    return this.message.list();
  }

  @Post()
  create(@Body() dto: CreateMessageDto) {
    return this.message.create(dto);
  }
}

@UseGuards(JwtGuard)
@Controller('admin/messages')
export class MessageAdminController {
  constructor(private readonly message: MessageService) {}

  @Get()
  list() {
    return this.message.list();
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.message.remove(id);
  }
}
