import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { rethrowPrismaError } from '../../common/errors/prisma-error.mapper';
import { getPageParams, toPageResult } from '../../common/utils/pagination';
import { CreateMessageDto } from './dto/message.dto';

const MESSAGE_ORDER_BY = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.message.findMany({ orderBy: MESSAGE_ORDER_BY, take: 100 });
  }

  async adminList(query: PageQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const [items, total] = await Promise.all([
      this.prisma.message.findMany({ orderBy: MESSAGE_ORDER_BY, skip, take }),
      this.prisma.message.count(),
    ]);
    return toPageResult(items, total, page, pageSize);
  }

  create(dto: CreateMessageDto) {
    return this.prisma.message.create({ data: dto });
  }

  async remove(id: number) {
    try {
      await this.prisma.message.delete({ where: { id } });
      return { ok: true };
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Message not found' });
    }
  }
}
