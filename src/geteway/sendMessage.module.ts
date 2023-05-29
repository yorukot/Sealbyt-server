import { Module } from '@nestjs/common';
import { SendMessageGateway } from './sendMessage.gateway';
import { GetewayService } from './geteway.service';

@Module({
  providers: [SendMessageGateway, GetewayService],
})
export class GetewayModule {}
