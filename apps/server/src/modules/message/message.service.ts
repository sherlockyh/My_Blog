import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateMessageDto } from './message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.message.findMany({ orderBy: { createdAt: 'desc' }, take: 100 });
  }

  create(dto: CreateMessageDto) {
    return this.prisma.message.create({ data: dto });
  }

  async remove(id: number) {
    const row = await this.prisma.message.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Message not found');
    await this.prisma.message.delete({ where: { id } });
    return { ok: true };
  }
}
