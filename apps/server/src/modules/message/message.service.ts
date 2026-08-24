import { Injectable } from '@nestjs/common';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { rethrowPrismaError } from '../../common/errors/prisma-error.mapper';
import { getPageParams, toPageResult } from '../../common/utils/pagination';
import { CreateMessageDto } from './dto/message.dto';
import { toMessageDto, toMessageDtos } from './mappers/message.mapper';
import { MessageRepository } from './repositories/message.repository';

@Injectable()
export class MessageService {
  constructor(private readonly messages: MessageRepository) {}

  list() {
    return this.messages.listRecent().then(toMessageDtos);
  }

  async adminList(query: PageQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const [items, total] = await Promise.all([
      this.messages.findPage(skip, take),
      this.messages.count(),
    ]);
    return toPageResult(toMessageDtos(items), total, page, pageSize);
  }

  create(dto: CreateMessageDto) {
    return this.messages.create(dto).then(toMessageDto);
  }

  async remove(id: number) {
    try {
      await this.messages.delete(id);
      return { ok: true };
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Message not found' });
    }
  }
}
