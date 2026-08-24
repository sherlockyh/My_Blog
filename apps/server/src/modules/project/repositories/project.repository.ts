import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';

const PROJECT_ORDER_BY = [{ sort: 'asc' as const }, { createdAt: 'desc' as const }, { id: 'desc' as const }];

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.project.findMany({ orderBy: PROJECT_ORDER_BY });
  }

  findPage(skip: number, take: number) {
    return this.prisma.project.findMany({ orderBy: PROJECT_ORDER_BY, skip, take });
  }

  count() {
    return this.prisma.project.count();
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

  update(id: number, dto: UpdateProjectDto) {
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  delete(id: number) {
    return this.prisma.project.delete({ where: { id } });
  }
}
