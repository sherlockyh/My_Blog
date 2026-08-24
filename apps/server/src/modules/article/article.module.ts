import { Module } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { ViewCountModule } from '../view-count/view-count.module';
import { ArticleAdminController } from './controllers/article-admin.controller';
import { ArticleController } from './controllers/article.controller';
import { ArticleRepository } from './repositories/article.repository';
import { ArticleService } from './article.service';

@Module({
  imports: [AuditModule, ViewCountModule],
  controllers: [ArticleController, ArticleAdminController],
  providers: [ArticleRepository, ArticleService],
})
export class ArticleModule {}
