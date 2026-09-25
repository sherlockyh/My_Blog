import { Module } from '@nestjs/common';
import { ViewCountService } from './view-count.service';

@Module({
  providers: [ViewCountService],
  exports: [ViewCountService],
})
export class ViewCountModule {}
