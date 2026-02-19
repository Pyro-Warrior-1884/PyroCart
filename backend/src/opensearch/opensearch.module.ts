import { Module } from '@nestjs/common';
import { OpensearchController } from './opensearch.controller';
import { OpensearchService } from './opensearch.service';

@Module({
  controllers: [OpensearchController],
  providers: [OpensearchService],
  exports: [OpensearchService],
})
export class OpensearchModule {}
