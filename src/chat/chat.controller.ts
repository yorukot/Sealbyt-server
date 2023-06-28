import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatRoomDto, GetMessageDto, SendMessageDto } from './dto';
import { Response } from 'express';

@Controller('chat')
export class ChatController {
  constructor(private charService: ChatService) {}
  //發送好友邀請
  @Post('createchatroom')
  @UsePipes(new ValidationPipe())
  CreateChatRoom(@Body() dto: CreateChatRoomDto, @Res() res: Response) {
    return this.charService.CreateRoom(res, dto);
  }

  @Post('sendmessage')
  @UsePipes(new ValidationPipe())
  SendMessage(@Body() dto: SendMessageDto, @Res() res: Response) {
    return this.charService.SendMessage(dto, res);
  }

  @Get('/message/:roomId')
  @UsePipes(new ValidationPipe())
  GetMessage(
    @Body() dto: GetMessageDto,
    @Param('roomId') id: string,
    @Res() res: Response,
    @Query('limit') limit: number,
    @Query('before') before_time: number,
  ) {
    return this.charService.GetMessage(limit, before_time, id, dto, res);
  }
}
