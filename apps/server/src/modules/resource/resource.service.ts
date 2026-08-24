import { Injectable } from '@nestjs/common';
import { PageQueryDto } from '../../common/dto/page-query.dto';
import { rethrowPrismaError } from '../../common/errors/prisma-error.mapper';
import { getPageParams, toPageResult } from '../../common/utils/pagination';
import { CreateResourceDto, UpdateResourceDto } from './dto/resource.dto';
import { toResourceDto, toResourceDtos } from './mappers/resource.mapper';
import { ResourceRepository } from './repositories/resource.repository';

@Injectable()
export class ResourceService {
  constructor(private readonly resources: ResourceRepository) {}

  list() {
    return this.resources.list().then(toResourceDtos);
  }

  async adminList(query: PageQueryDto) {
    const { page, pageSize, skip, take } = getPageParams(query);
    const [items, total] = await Promise.all([
      this.resources.findPage(skip, take),
      this.resources.count(),
    ]);
    return toPageResult(toResourceDtos(items), total, page, pageSize);
  }

  create(dto: CreateResourceDto) {
    return this.resources.create(dto).then(toResourceDto);
  }

  async update(id: number, dto: UpdateResourceDto) {
    try {
      return toResourceDto(await this.resources.update(id, dto));
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Resource not found' });
    }
  }

  async remove(id: number) {
    try {
      await this.resources.delete(id);
      return { ok: true };
    } catch (err) {
      rethrowPrismaError(err, { notFound: 'Resource not found' });
    }
  }
}
