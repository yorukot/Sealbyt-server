import {
  Body,
  Controller,
  Post,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { KeyService } from './key.service';
import { CreateChatKeyDto } from './dto';
import { Response } from 'express';

@Controller('key')
export class KeyController {
  constructor(private keyService: KeyService) {}

  @Post('createkeyexchange')
  @UsePipes(new ValidationPipe())
  LogInLocal(@Body() dto: CreateChatKeyDto, @Res() res: Response) {
    return this.keyService.createkeyexchange(dto, res);
  }
}
