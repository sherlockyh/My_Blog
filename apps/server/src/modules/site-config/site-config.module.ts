import { Module } from '@nestjs/common';
import { ViewCountModule } from '../view-count/view-count.module';
import { SiteAdminController, SiteController } from './site-config.controller';
import { SiteConfigService } from './site-config.service';

@Module({
  imports: [ViewCountModule],
  controllers: [SiteController, SiteAdminController],
  providers: [SiteConfigService],
})
export class SiteConfigModule {}
