import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RelationshipService } from './relationship.service';
import { Response } from 'express';
import {
  GetFriendRequestListDto,
  RelationShipDto,
  DecideFriendRequestDto,
  GetFriendListDto,
} from './dto/index';

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
  @Post('acceptfriend')
  @UsePipes(new ValidationPipe())
  acceptFriendRequest(
    @Body() dto: DecideFriendRequestDto,
    @Res() res: Response,
  ) {
    return this.RelationShipService.AcceptFriendRequest(res, dto);
  }
  //拒絕好友請求
  @Post('rejectfriend')
  @UsePipes(new ValidationPipe())
  RejectFriendRequest(
    @Body() dto: DecideFriendRequestDto,
    @Res() res: Response,
  ) {
    return this.RelationShipService.RejectFriendRequest(res, dto);
  }
  //取得好友請求列表
  @Get('friendrequestlist')
  @UsePipes(new ValidationPipe())
  GetFriendRequestList(
    @Body() dto: GetFriendRequestListDto,
    @Res() res: Response,
  ) {
    return this.RelationShipService.GetFriendsRequestList(dto, res);
  }

  //取得好友列表
  @Get('friendlist')
  @UsePipes(new ValidationPipe())
  GetFriendList(@Body() dto: GetFriendListDto, @Res() res: Response) {
    return this.RelationShipService.GetFriendList(res, dto);
  }
}
