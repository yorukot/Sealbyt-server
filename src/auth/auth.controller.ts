import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Res,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SingUpDto } from './dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  LogInLocal(@Body() dto: AuthDto, @Req() req: Request, @Res() res: Response) {
    return this.authService.LogInLocal(dto, req, res);
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
}
