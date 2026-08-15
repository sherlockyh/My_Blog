import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/jwt.guard';
import { ArticleService } from './article.service';
import { CreateArticleDto, UpdateArticleDto } from './article.dto';

@UseGuards(JwtGuard)
@Controller('admin/articles')
export class ArticleAdminController {
  constructor(private readonly article: ArticleService) {}

  @Get()
  list() {
    return this.article.adminList();
  }

  @Post()
  create(@Body() dto: CreateArticleDto) {
    return this.article.create(dto);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    return this.article.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.article.remove(id);
  }
}
