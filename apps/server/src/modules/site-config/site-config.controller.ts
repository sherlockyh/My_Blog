import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../../common/jwt.guard';
import { SiteConfigService } from './site-config.service';
import { UpdateProfileDto, UpdateSiteConfigDto } from './site-config.dto';

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
  updateConfig(@Body() dto: UpdateSiteConfigDto) {
    return this.site.updateConfig(dto);
  }

  @Put('profile')
  updateProfile(@Body() dto: UpdateProfileDto) {
    return this.site.updateProfile(dto);
  }

  @Get('stats')
  stats() {
    return this.site.stats();
  }
}
