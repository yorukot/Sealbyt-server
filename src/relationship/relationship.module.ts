import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RelationshipController } from './relationship.controller';
import { RelationshipService } from './relationship.service';
import {
  PostRelationshipMiddleware,
  GetRelationshipMiddleware,
  PutAndDeleteRelationshipMiddleware,
} from './middleware/relationship.middleware';

@Module({
  controllers: [RelationshipController],
  providers: [RelationshipService],
})
export class RelationshipModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(PostRelationshipMiddleware)
      .forRoutes({ path: 'relationship*', method: RequestMethod.POST });
    consumer
      .apply(PutAndDeleteRelationshipMiddleware)
      .forRoutes({ path: 'relationship*', method: RequestMethod.DELETE });
    consumer
      .apply(PutAndDeleteRelationshipMiddleware)
      .forRoutes({ path: 'relationship*', method: RequestMethod.PUT });
    consumer
      .apply(GetRelationshipMiddleware)
      .forRoutes({ path: 'relationship*', method: RequestMethod.GET });
  }
}
