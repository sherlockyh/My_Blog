import { Injectable, NotFoundException } from '@nestjs/common';
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

/** 列表不查询正文，避免首页和后台分页携带全部项目内容。 */
const PROJECT_LIST_SELECT = {
  id: true,
  titleZh: true,
  titleEn: true,
  descZh: true,
  descEn: true,
  cover: true,
  tags: true,
  link: true,
  featured: true,
  sort: true,
  createdAt: true,
} as const;

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.project.findMany({ select: PROJECT_LIST_SELECT, orderBy: PROJECT_ORDER_BY });
  }

  /** 公开详情和后台编辑共用完整项目查询，不存在时统一返回 404。 */
  async detail(id: number) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  async adminList(query: PageQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const [items, total] = await Promise.all([
      this.prisma.project.findMany({
        select: PROJECT_LIST_SELECT,
        orderBy: PROJECT_ORDER_BY,
        skip,
        take,
      }),
      this.prisma.project.count(),
    ]);
    return toPageResult(items, total, page, pageSize);
  }

  featured() {
    return this.prisma.project.findMany({
      select: PROJECT_LIST_SELECT,
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
