import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { rethrowPrismaError } from '../../common/errors/prisma-error.mapper';
import { getPageParams, toPageResult } from '../../common/utils/pagination';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';

const RESOURCE_ORDER_BY = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

@Injectable()
export class ResourceService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.resource.findMany({ orderBy: RESOURCE_ORDER_BY });
  }

  async adminList(query: PageQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const [items, total] = await Promise.all([
      this.prisma.resource.findMany({ orderBy: RESOURCE_ORDER_BY, skip, take }),
      this.prisma.resource.count(),
    ]);
    return toPageResult(items, total, page, pageSize);
  }

  create(dto: CreateResourceDto) {
    return this.prisma.resource.create({ data: dto });
  }

  async update(id: number, dto: UpdateResourceDto) {
    try {
      return await this.prisma.resource.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Resource not found' });
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.resource.delete({ where: { id } });
      return { ok: true };
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Resource not found' });
    }
  }
}
