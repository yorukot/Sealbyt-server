import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto, LogInUserDto, SingUpDto } from './dto';
import user_datas_client from 'src/DataBase/connect/UserDatas';
import { JwtService } from '@nestjs/jwt';
import generateUserId from 'src/function/generate/GenerateUserid';
import { Request, Response } from 'express';
import JwtVerifyToken from 'src/function/verify/JwtVerify';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private jwtService: JwtService) {}

  async LogInLocal(dto: AuthDto, req: Request, res: Response) {
    const user_query = `SELECT * FROM users WHERE email = ?`;
    const user_parmas = [dto.email];
    const user = (
      await user_datas_client.execute(user_query, user_parmas, {
        prepare: true,
      })
    ).rows[0];
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
    const check_user_name_has_been_use_query = `SELECT * FROM users WHERE name = ?;`;
    const check_user_name_has_been_use_parmas = [dto.name];
    const user_name_has_been_use = await user_datas_client.execute(
      check_user_name_has_been_use_query,
      check_user_name_has_been_use_parmas,
      { prepare: true },
    );
    if (user_name_has_been_use.rowLength !== 0)
      throw new UnauthorizedException('User name has been use');
    const check_user_email_has_been_use_query = `SELECT * FROM users WHERE email = ?;`;
    const check_user_email_has_been_use_parmas = [dto.email];
    const user_eail_has_been_use = await user_datas_client.execute(
      check_user_email_has_been_use_query,
      check_user_email_has_been_use_parmas,
      { prepare: true },
    );
    if (user_eail_has_been_use.rowLength !== 0)
      throw new UnauthorizedException('User email has been use');

    const id = generateUserId();
    const user_create_data_query = `INSERT INTO users (id, email, displayName, password, name, createAt, status, avatar, twoFactorKey, factor) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const user_create_data_parmas = [
      BigInt(id),
      dto.email,
      null,
      dto.password,
      dto.name,
      Date.now(),
      0,
      null,
      null,
      0,
    ];
    const user_create_data = await user_datas_client.execute(
      user_create_data_query,
      user_create_data_parmas,
      {
        prepare: true,
      },
    );
    if (!user_create_data.wasApplied())
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
