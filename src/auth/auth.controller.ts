import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Res,
  Req,
  Get,
  Ip,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SingUpDto } from './dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @UsePipes(new ValidationPipe())
  LogInLocal(
    @Ip() ip: string,
    @Body() dto: AuthDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.LogInLocal(dto, ip, req, res);
  }

  @Post('signup')
  @UsePipes(new ValidationPipe())
  SignUpLocal(
    @Body() dto: SingUpDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    return this.authService.SignUpLocal(dto, req, res);
  }
  @Get('refreshtoken')
  RefreshToken(@Req() req: Request, @Res() res: Response) {
    return this.authService.RefreshToken(req, res);
  }

  @Get('permission')
  getHello(@Req() req: Request, @Res() res: Response) {
    return this.authService.hasPermission(req, res);
  }
}
