import { Module } from '@nestjs/common';
import { ViewCountModule } from '../view-count/view-count.module';
import { ArticleAdminController } from './article-admin.controller';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [ViewCountModule],
  controllers: [ArticleController, ArticleAdminController],
  providers: [ArticleService],
})
export class ArticleModule {}
