import { Global, Module } from '@nestjs/common';
import { UserGeteway } from './user.gateway';
import { UserGetewayService } from './user.service';

@Global()
@Module({
  providers: [UserGeteway, UserGetewayService],
  exports: [UserGetewayService],
})
export class GetewayModule {}
