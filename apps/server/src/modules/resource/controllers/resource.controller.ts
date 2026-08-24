import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuditAction } from '../../../common/audit/audit.decorator';
import { AuditInterceptor } from '../../../common/audit/audit.interceptor';
import { PageQueryDto } from '../../../common/dto/page-query.dto';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { ResourceService } from '../resource.service';
import { CreateResourceDto, UpdateResourceDto } from '../dto/resource.dto';

@Controller('resources')
export class ResourceController {
  constructor(private readonly resource: ResourceService) {}

  @Get()
  list() {
    return this.resource.list();
  }
}

@UseGuards(JwtGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/resources')
export class ResourceAdminController {
  constructor(private readonly resource: ResourceService) {}

  @Get()
  list(@Query() query: PageQueryDto) {
    return this.resource.adminList(query);
  }

  @Post()
  @AuditAction({ action: 'resource.create', targetType: 'resource', targetIdPath: 'result.id', detailPaths: { titleZh: 'result.titleZh', category: 'result.category' } })
  create(@Body() dto: CreateResourceDto) {
    return this.resource.create(dto);
  }

  @Put(':id')
  @AuditAction({ action: 'resource.update', targetType: 'resource', targetIdPath: 'result.id', detailPaths: { titleZh: 'result.titleZh', category: 'result.category' } })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResourceDto) {
    return this.resource.update(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'resource.delete', targetType: 'resource', targetIdPath: 'params.id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resource.remove(id);
  }
}
