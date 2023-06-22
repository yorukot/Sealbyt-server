import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import {
  GetChatMiddleware,
  PostChatMiddleware,
  PutAndDeleteChatMiddleware,
} from './middleware/chat.middleware';

@Module({})
export class ChatModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PostChatMiddleware)
      .forRoutes({ path: 'chat*', method: RequestMethod.POST });
    consumer
      .apply(PutAndDeleteChatMiddleware)
      .forRoutes({ path: 'chat*', method: RequestMethod.DELETE });
    consumer
      .apply(PutAndDeleteChatMiddleware)
      .forRoutes({ path: 'chat*', method: RequestMethod.PUT });
    consumer
      .apply(GetChatMiddleware)
      .forRoutes({ path: 'chat*', method: RequestMethod.GET });
  }
}
