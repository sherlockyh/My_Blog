import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { AuditAction } from '../../../common/audit/audit.decorator';
import { JwtGuard } from '../../../common/guards/jwt.guard';
import { SiteConfigService } from '../site-config.service';
import { UpdateProfileDto, UpdateSiteConfigDto } from '../dto/site-config.dto';

@Controller('site')
export class SiteController {
  constructor(private readonly site: SiteConfigService) {}

  @Get()
  get() {
    return this.site.getSite();
  }
}

@UseGuards(JwtGuard)
@Controller('admin')
export class SiteAdminController {
  constructor(private readonly site: SiteConfigService) {}

  @Put('site-config')
  @AuditAction({
    action: 'site-config.update',
    targetType: 'site-config',
    targetId: 1,
    bodyFieldsDetailKey: 'fields',
  })
  updateConfig(@Body() dto: UpdateSiteConfigDto) {
    return this.site.updateConfig(dto);
  }

  @Put('profile')
  @AuditAction({
    action: 'profile.update',
    targetType: 'profile',
    targetId: 1,
    bodyFieldsDetailKey: 'fields',
  })
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.site.updateProfile(dto);
  }

  @Get('stats')
  stats() {
    return this.site.stats();
  }
}
