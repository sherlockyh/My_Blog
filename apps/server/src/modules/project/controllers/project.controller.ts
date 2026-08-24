import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuditAction } from '../../../common/audit/audit.decorator';
import { AuditInterceptor } from '../../../common/audit/audit.interceptor';
import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { ProjectService } from '../project.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly project: ProjectService) {}

  @Get()
  list() {
    return this.project.list();
  }
}

@UseGuards(JwtGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/projects')
export class ProjectAdminController {
  constructor(private readonly project: ProjectService) {}

  @Get()
  list(@Query() query: PageQueryDto) {
    return this.project.adminList(query);
  }

  @Post()
  @AuditAction({ action: 'project.create', targetType: 'project', targetIdPath: 'result.id', detailPaths: { titleZh: 'result.titleZh', featured: 'result.featured' } })
  create(@Body() dto: CreateProjectDto) {
    return this.project.create(dto);
  }

  @Put(':id')
  @AuditAction({ action: 'project.update', targetType: 'project', targetIdPath: 'result.id', detailPaths: { titleZh: 'result.titleZh', featured: 'result.featured' } })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.project.update(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'project.delete', targetType: 'project', targetIdPath: 'params.id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.project.remove(id);
  }
}
