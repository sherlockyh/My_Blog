import { Module } from '@nestjs/common';
import { AuditModule } from '../../common/audit/audit.module';
import { ViewCountModule } from '../view-count/view-count.module';
import { SiteAdminController, SiteController } from './controllers/site-config.controller';
import { SiteConfigService } from './site-config.service';

@Module({
  imports: [AuditModule, ViewCountModule],
  controllers: [SiteController, SiteAdminController],
  providers: [SiteConfigService],
})
export class SiteConfigModule {}
