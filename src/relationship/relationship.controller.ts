import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RelationshipService } from './relationship.service';
import { Request, Response } from 'express';
import { RelationShipDto, GetFriendListDto } from './dto/index';

@Controller('relationship')
export class RelationshipController {
  constructor(private RelationShipService: RelationshipService) {}
  //發送好友邀請
  @Post('addfriend')
  @UsePipes(new ValidationPipe())
  addFriend(@Body() dto: RelationShipDto, @Res() res: Response) {
    return this.RelationShipService.AddFriend(res, dto);
  }
  //同意好友請求
  @Put('acceptfriend/:id')
  @UsePipes(new ValidationPipe())
  acceptFriendRequest(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.RelationShipService.AcceptFriendRequest(
      req.user as string,
      res,
      id,
    );
  }
  //拒絕好友請求
  @Delete('rejectfriend/:id')
  @UsePipes(new ValidationPipe())
  RejectFriendRequest(
    @Param('id') id: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.RelationShipService.RejectFriendRequest(
      req.user as string,
      res,
      id,
    );
  }
  //取得好友列表
  @Get()
  @UsePipes(new ValidationPipe())
  GetFriendList(@Body() dto: GetFriendListDto, @Res() res: Response) {
    return this.RelationShipService.GetRelationshipList(res, dto);
  }
}
