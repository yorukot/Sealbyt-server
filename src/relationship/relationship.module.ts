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
} from 'src/common/middleware/relationship.middleware';

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
      .apply(GetRelationshipMiddleware)
      .forRoutes({ path: 'relationship*', method: RequestMethod.GET });
  }
}
