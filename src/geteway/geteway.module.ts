import { Global, Module } from '@nestjs/common';
import { UserGeteway } from './geteway.gateway';
import { UserGetewayService } from './geteway.service';

@Global()
@Module({
  providers: [UserGeteway, UserGetewayService],
  exports: [UserGetewayService],
})
export class GetewayModule {}
