import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChatRoomDto } from './dto';
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
}
