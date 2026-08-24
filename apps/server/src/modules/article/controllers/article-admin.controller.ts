import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuditAction } from '../../../common/audit/audit.decorator';
import { AuditInterceptor } from '../../../common/audit/audit.interceptor';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { ArticleService } from '../article.service';
import { AdminArticleQueryDto, CreateArticleDto, UpdateArticleDto } from '../dto/article.dto';

@UseGuards(JwtGuard)
@UseInterceptors(AuditInterceptor)
@Controller('admin/articles')
export class ArticleAdminController {
  constructor(private readonly article: ArticleService) {}

  @Get()
  list(@Query() query: AdminArticleQueryDto) {
    return this.article.adminList(query);
  }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) {
    return this.article.findAdminById(id);
  }

  @Post()
  @AuditAction({ action: 'article.create', targetType: 'article', targetIdPath: 'result.id', detailPaths: { slug: 'result.slug', status: 'result.status' } })
  create(@Body() dto: CreateArticleDto) {
    return this.article.create(dto);
  }

  @Put(':id')
  @AuditAction({ action: 'article.update', targetType: 'article', targetIdPath: 'result.id', detailPaths: { slug: 'result.slug', status: 'result.status' } })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateArticleDto) {
    return this.article.update(id, dto);
  }

  @Delete(':id')
  @AuditAction({ action: 'article.delete', targetType: 'article', targetIdPath: 'params.id' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.article.remove(id);
  }
}
