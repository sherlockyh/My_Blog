import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.project.findMany({ orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }] });
  }

  featured() {
    return this.prisma.project.findMany({
      where: { featured: true },
      orderBy: [{ sort: 'asc' }, { createdAt: 'desc' }],
      take: 3,
    });
  }

  create(dto: CreateProjectDto) {
    return this.prisma.project.create({ data: dto });
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.ensureExists(id);
    return this.prisma.project.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.project.delete({ where: { id } });
    return { ok: true };
  }

  private async ensureExists(id: number) {
    const row = await this.prisma.project.findUnique({ where: { id } });
    if (!row) throw new NotFoundException('Project not found');
  }
}
