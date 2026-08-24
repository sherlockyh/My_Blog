import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateMessageDto } from '../dto/message.dto';

const MESSAGE_ORDER_BY = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

@Injectable()
export class MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  listRecent() {
    return this.prisma.message.findMany({ orderBy: MESSAGE_ORDER_BY, take: 100 });
  }

  findPage(skip: number, take: number) {
    return this.prisma.message.findMany({ orderBy: MESSAGE_ORDER_BY, skip, take });
  }

  count() {
    return this.prisma.message.count();
  }

  create(dto: CreateMessageDto) {
    return this.prisma.message.create({ data: dto });
  }

  delete(id: number) {
    return this.prisma.message.delete({ where: { id } });
  }
}
