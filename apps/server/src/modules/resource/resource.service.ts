import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateResourceDto, UpdateResourceDto } from './resource.dto';

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(dto: CreateResourceDto) {
    return this.prisma.resource.create({ data: dto });
  }

  async update(id: number, dto: UpdateResourceDto) {
    await this.ensureExists(id);
    return this.prisma.resource.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.resource.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureExists(id: number) {
    const row = await this.prisma.resource.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Resource not found');
  }
}
