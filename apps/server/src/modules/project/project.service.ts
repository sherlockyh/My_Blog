import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { rethrowPrismaError } from '../../common/errors/prisma-error.mapper';
import { getPageParams, toPageResult } from '../../common/utils/pagination';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';

const PROJECT_ORDER_BY = [
  { sort: 'asc' as const },
  { createdAt: 'desc' as const },
  { id: 'desc' as const },
];

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.project.findMany({ orderBy: PROJECT_ORDER_BY });
  }

  async adminList(query: PageQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({ orderBy: PROJECT_ORDER_BY, skip, take }),
      this.prisma.project.count(),
    ]);
    return toPageResult(items, total, page, pageSize);
  }

  featured() {
    return this.prisma.project.findMany({
      where: { featured: true },
      orderBy: PROJECT_ORDER_BY,
      take: 3,
    });
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  async update(id: number, dto: UpdateProjectDto) {
    try {
      return await this.prisma.project.update({ where: { id }, data: dto });
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Project not found' });
    }
  }

  async remove(id: number) {
    try {
      await this.prisma.project.delete({ where: { id } });
      return { ok: true };
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Project not found' });
    }
  }
}
