import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import JwtVerifyToken from 'src/function/verify/JwtVerify';

@Injectable()
export class PostChatMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const jwt_key: any = JwtVerifyToken(req.cookies.accessToken);
    if (!jwt_key) throw new UnauthorizedException('Unauthorized');
    req.body.sender_user_id = jwt_key.id;
    next();
  }
}
export class GetChatMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const jwt_key: any = JwtVerifyToken(req.cookies.accessToken);
    if (!jwt_key) throw new UnauthorizedException('Unauthorized');
    req.body.user_id = jwt_key.id;
    next();
  }
}

export class PutAndDeleteChatMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => void) {
    const jwt_key: any = JwtVerifyToken(req.cookies.accessToken);
    if (!jwt_key) throw new UnauthorizedException('Unauthorized');
    req.user = jwt_key.id;
    next();
  }
}
