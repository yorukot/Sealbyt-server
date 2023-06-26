import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { KeyService } from './key.service';
import {
  CreateKeyExchangeDto,
  GetKeyExchangeDto,
  UpdateKeyExchangeDto,
  CreateKeyDto,
  GetKeyDto,
} from './dto';
import { Request, Response } from 'express';

@Controller('key')
export class KeyController {
  constructor(private keyService: KeyService) {}

  @Post('createkeyexchange')
  @UsePipes(new ValidationPipe())
  CreateKeyExchange(@Body() dto: CreateKeyExchangeDto, @Res() res: Response) {
    return this.keyService.CreateKeyExchange(dto, res);
  }

  @Post('updatekeyexchange')
  @UsePipes(new ValidationPipe())
  UpdateKeyExchange(@Body() dto: UpdateKeyExchangeDto, @Res() res: Response) {
    return this.keyService.UpdateKeyExchange(dto, res);
  }

  @Post('createkey')
  @UsePipes(new ValidationPipe())
  CreateKey(@Body() dto: CreateKeyDto, @Res() res: Response) {
    return this.keyService.CreateKey(dto, res);
  }

  @Get('getkeyexchange')
  @UsePipes(new ValidationPipe())
  GetKeyExchange(@Body() dto: GetKeyExchangeDto, @Res() res: Response) {
    return this.keyService.GetKeyExchange(dto, res);
  }

  @Put('keyconfirm/:roomid')
  @UsePipes(new ValidationPipe())
  KeyConfrim(
    @Param('roomid') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.keyService.KeyConfirm(id, res, req);
  }

  @Get('/:roomid')
  GetKey(
    @Body() dto: GetKeyDto,
    @Param('roomid') id: string,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    return this.keyService.GetKey(id, res, req, dto.user_id);
  }
}
