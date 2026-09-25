import { Module } from '@nestjs/common';
import { ViewCountModule } from '../view-count/view-count.module';
import { SiteAdminController, SiteController } from './controllers/site-config.controller';
import { SiteConfigService } from './site-config.service';

@Module({
  imports: [ViewCountModule],
  controllers: [SiteController, SiteAdminController],
  providers: [SiteConfigService],
  exports: [SiteConfigService],
})
export class SiteConfigModule {}
