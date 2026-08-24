import { Injectable } from '@nestjs/common';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { rethrowPrismaError } from '../../common/errors/prisma-error.mapper';
import { getPageParams, toPageResult } from '../../common/utils/pagination';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.dto';
import { toProjectDto, toProjectDtos } from './mappers/project.mapper';
import { ProjectRepository } from './repositories/project.repository';

@Injectable()
export class ProjectService {
  constructor(private readonly projects: ProjectRepository) {}

  list() {
    return this.projects.list().then(toProjectDtos);
  }

  async adminList(query: PageQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const [items, total] = await Promise.all([
      this.projects.findPage(skip, take),
      this.projects.count(),
    ]);
    return toPageResult(toProjectDtos(items), total, page, pageSize);
  }

  featured() {
    return this.projects.featured().then(toProjectDtos);
  }

  create(dto: CreateProjectDto) {
    return this.projects.create(dto).then(toProjectDto);
  }

  async update(id: number, dto: UpdateProjectDto) {
    try {
      return toProjectDto(await this.projects.update(id, dto));
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Project not found' });
    }
  }

  async remove(id: number) {
    try {
      await this.projects.delete(id);
      return { ok: true };
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Project not found' });
    }
  }
}
