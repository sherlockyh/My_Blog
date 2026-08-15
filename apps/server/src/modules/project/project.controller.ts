import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/jwt.guard';
import { ProjectService } from './project.service';
import { CreateProjectDto, UpdateProjectDto } from './project.dto';

@Controller('projects')
export class ProjectController {
  constructor(private readonly project: ProjectService) {}

  @Get()
  list() {
    return this.project.list();
  }
}

@UseGuards(JwtGuard)
@Controller('admin/projects')
export class ProjectAdminController {
  constructor(private readonly project: ProjectService) {}

  @Get()
  list() {
    return this.project.list();
  }

  @Post()
  create(@Body() dto: CreateProjectDto) {
    return this.project.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.project.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.project.remove(id);
  }
}
