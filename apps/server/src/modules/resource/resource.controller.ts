import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/jwt.guard';
import { ResourceService } from './resource.service';
import { CreateResourceDto, UpdateResourceDto } from './resource.dto';

@Controller('resources')
export class ResourceController {
  constructor(private readonly resource: ResourceService) {}

  @Get()
  list() {
    return this.resource.list();
  }
}

@UseGuards(JwtGuard)
@Controller('admin/resources')
export class ResourceAdminController {
  constructor(private readonly resource: ResourceService) {}

  @Get()
  list() {
    return this.resource.list();
  }

  @Post()
  create(@Body() dto: CreateResourceDto) {
    return this.resource.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateResourceDto) {
    return this.resource.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.resource.remove(id);
  }
}
