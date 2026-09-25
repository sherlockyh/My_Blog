import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { RequestContext } from '../../../common/types/request';
import { ArticleService } from '../article.service';
import { ArticleQueryDto } from '../dto/article.dto';

@Controller('articles')
export class ArticleController {
  constructor(private readonly article: ArticleService) {}

  @Get()
  list(@Query() query: ArticleQueryDto) {
    return this.article.listPublic(query);
  }

  @Get('tags')
  tags() {
    return this.article.allTags();
  }

  @Get('all')
  all() {
    return this.article.listAllPublished();
  }

  @Get(':slug')
  detail(@Param('slug') slug: string, @Req() req: RequestContext) {
    return this.article.findBySlug(slug, req.ip ?? 'unknown');
  }
}
