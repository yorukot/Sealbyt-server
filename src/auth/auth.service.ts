import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto, LogInUserDto, SingUpDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import generateUserId from 'src/function/generate/GenerateUserid';
import { Request, Response } from 'express';
import JwtVerifyToken from 'src/function/verify/JwtVerify';
import FindUsersByEmail from 'src/DataBase/function/Find/users/FindByEmail';
import FindUsersByName from 'src/DataBase/function/Find/users/FindByName';
import createUsersData from 'src/DataBase/function/Create/users/createdata';
import validateUsername from 'src/function/verify/UserNameVerify';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private jwtService: JwtService) {}

  async LogInLocal(dto: AuthDto, req: Request, res: Response) {
    const user = await FindUsersByEmail(dto.email);
    if (!user || user.password !== dto.password)
      throw new UnauthorizedException('User or password does not exist');
    const accessToken = this.LogInUser({
      id: user.id,
      name: user.name,
      password: user.password,
    });
    res.cookie('accessToken', accessToken, {
      expires: new Date(new Date().getTime() + 16 * 60 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    this.logger.log(`${user.id}(${user.name}) logged in`);
    return res.status(200).send('SuccessFul Log In');
  }

  async SignUpLocal(dto: SingUpDto, req: Request, res: Response) {
    if (!validateUsername(dto.name))
      throw new BadRequestException(
        'Use only letters, numbers, dot and underscores',
      );
    const user_name_has_been_use = await FindUsersByName(dto.name);
    if (user_name_has_been_use)
      throw new UnauthorizedException('User name has been use');
    const user_eail_has_been_use = await FindUsersByEmail(dto.email);
    if (user_eail_has_been_use)
      throw new UnauthorizedException('User email has been use');

    const id = generateUserId();
    const user_create_data = await createUsersData(
      id,
      dto.email,
      dto.name,
      dto.password,
      dto.name,
      Date.now(),
      0,
      null,
      null,
      0,
    );
    if (!user_create_data)
      throw new HttpException(
        'DataBase has some worng',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    const accessToken = this.LogInUser({
      id: id,
      name: dto.name,
      password: dto.password,
    });
    res.cookie('accessToken', accessToken, {
      expires: new Date(new Date().getTime() + 16 * 60 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    this.logger.log(`${id}(${dto.name}) sign up`);
    return res.status(201).send('SuccessFul Sign Up');
  }

  hasPermission(req: Request, res: Response) {
    if (!JwtVerifyToken(req.cookies.accessToken)) {
      throw new UnauthorizedException('User do not have permission.');
    } else {
      res.status(200).send('Permission granted.');
    }
  }

  LogInUser(log_in_dto: LogInUserDto) {
    return this.jwtService.sign({
      id: log_in_dto.id,
      name: log_in_dto.name,
      password: log_in_dto.password,
    });
  }
}

/*
0=離線
1=在線
2=休息
3=請勿打擾
*/
