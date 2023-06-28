import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { GetewayModule } from './geteway/geteway.module';
import { RelationshipController } from './relationship/relationship.controller';
import { RelationshipService } from './relationship/relationship.service';
import { RelationshipModule } from './relationship/relationship.module';
import { KeyController } from './key/key.controller';
import { KeyService } from './key/key.service';
import { KeyModule } from './key/key.module';
import { ChatController } from './chat/chat.controller';
import { ChatService } from './chat/chat.service';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    GetewayModule,
    RelationshipModule,
    KeyModule,
    ChatModule,
  ],
  controllers: [
    AppController,
    RelationshipController,
    KeyController,
    ChatController,
  ],
  providers: [AppService, RelationshipService, KeyService, ChatService],
})
export class AppModule {}
