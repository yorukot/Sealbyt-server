import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import {
  GetKeyMiddleware,
  PostKeyMiddleware,
  PutAndDeleteKeyMiddleware,
} from './middleware/key.middleware';

@Module({})
export class KeyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PostKeyMiddleware)
      .forRoutes({ path: 'key*', method: RequestMethod.POST });
    consumer
      .apply(PutAndDeleteKeyMiddleware)
      .forRoutes({ path: 'key*', method: RequestMethod.DELETE });
    consumer
      .apply(PutAndDeleteKeyMiddleware)
      .forRoutes({ path: 'key*', method: RequestMethod.PUT });
    consumer
      .apply(GetKeyMiddleware)
      .forRoutes({ path: 'key*', method: RequestMethod.GET });
  }
}
