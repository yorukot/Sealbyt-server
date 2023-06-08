import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GetewayModule } from './geteway/user.module';
import { RelationshipController } from './relationship/relationship.controller';
import { RelationshipService } from './relationship/relationship.service';
import { RelationshipModule } from './relationship/relationship.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    GetewayModule,
    RelationshipModule,
  ],
  controllers: [AppController, RelationshipController],
  providers: [AppService, RelationshipService],
})
export class AppModule {}
