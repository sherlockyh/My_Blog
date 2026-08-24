import { Controller, Get, Param, Query, Req } from '@nestjs/common';
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

  @Get(':slug')
  detail(@Param('slug') slug: string, @Req() req: any) {
    return this.article.findBySlug(slug, req.ip);
  }
}
