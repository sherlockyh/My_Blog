import { Module } from '@nestjs/common';
import { ViewCountService } from './services/view-count.service';

@Module({
  providers: [ViewCountService],
  exports: [ViewCountService],
})
export class ViewCountModule {}
