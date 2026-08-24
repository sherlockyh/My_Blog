import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateResourceDto, UpdateResourceDto } from '../dto/resource.dto';

const RESOURCE_ORDER_BY = [{ createdAt: 'desc' as const }, { id: 'desc' as const }];

@Injectable()
export class ResourceRepository {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.resource.findMany({ orderBy: RESOURCE_ORDER_BY });
  }

  findPage(skip: number, take: number) {
    return this.prisma.resource.findMany({ orderBy: RESOURCE_ORDER_BY, skip, take });
  }

  count() {
    return this.prisma.resource.count();
  }

  create(dto: CreateResourceDto) {
    return this.prisma.resource.create({ data: dto });
  }

  update(id: number, dto: UpdateResourceDto) {
    return this.prisma.resource.update({ where: { id }, data: dto });
  }

  delete(id: number) {
    return this.prisma.resource.delete({ where: { id } });
  }
}
