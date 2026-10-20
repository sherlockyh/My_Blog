import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuditAction } from '../../../common/audit/audit.decorator';
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

  /** 获取项目完整介绍，供独立详情页使用。 */
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.project.detail(id);
  }
}

@UseGuards(JwtGuard)
@Controller('admin/projects')
export class ProjectAdminController {
  constructor(private readonly project: ProjectService) {}

  @Get()
  list(@Query() query: PageQueryDto) {
    return this.project.adminList(query);
  }

  /** 编辑和查看时按需读取正文，列表仍返回精简分页数据。 */
  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.project.detail(id);
  }

  @Post()
  @AuditAction({
    action: 'project.create',
    targetType: 'project',
    targetIdPath: 'result.id',
    detailPaths: { titleZh: 'result.titleZh', featured: 'result.featured' },
  })
  create(@Body() dto: CreateProjectDto) {
    return this.project.create(dto);
  }

  @Put(':id')
  @AuditAction({
    action: 'project.update',
    targetType: 'project',
    targetIdPath: 'result.id',
    detailPaths: { titleZh: 'result.titleZh', featured: 'result.featured' },
  })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.project.update(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'project.delete', targetType: 'project', targetIdPath: 'params.id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.project.remove(id);
  }
}
