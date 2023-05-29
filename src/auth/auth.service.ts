import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto, LogInUserDto, SingUpDto } from './dto';
import UsersDatasClient from 'src/DataBase/connect/UserDatas';
import { JwtService } from '@nestjs/jwt';
import generateUserId from 'src/function/generate/GenerateUserid';
import { Request, Response } from 'express';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async LogInLocal(dto: AuthDto, req: Request, res: Response) {
    const query = `SELECT * FROM users WHERE email = '${dto.email}'`;
    const user = (await UsersDatasClient.execute(query)).rows[0];
    if (!user) throw new UnauthorizedException('User does not exist');
    if (user.password !== dto.password)
      throw new UnauthorizedException('Passwords do not match');
    const accessToken = this.LogInUser({
      id: user.id,
      password: user.password,
    });
    res.cookie('accessToken', accessToken, {
      expires: new Date(new Date().getTime() + 16 * 60 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    return res.status(201).send('SuccessFul Log In');
  }

  async SignUpLocal(dto: SingUpDto, req: Request, res: Response) {
    const CheckUserNameHasBeenUse = `SELECT * FROM users WHERE name = '${dto.name}';`;
    const UserNameHasBeenUse = await UsersDatasClient.execute(
      CheckUserNameHasBeenUse,
    );
    if (UserNameHasBeenUse.rowLength !== 0)
      throw new UnauthorizedException('User name has been use');

    const CheckUserEmailHasBeenUse = `SELECT * FROM users WHERE email = '${dto.email}';`;
    const UserEailHasBeenUse = await UsersDatasClient.execute(
      CheckUserEmailHasBeenUse,
    );
    if (UserEailHasBeenUse.rowLength !== 0)
      throw new UnauthorizedException('User email has been use');

    const id = generateUserId();
    const query = `INSERT INTO users (id, name, email, password, createat, twofactor) VALUES ('${id}', '${
      dto.name
    }', '${dto.email}', '${dto.password}', ${Date.now()}, ${
      dto.twofactor || null
    })`;
    const userCreateData = await UsersDatasClient.execute(query);
    if (!userCreateData.wasApplied())
      throw new HttpException(
        'DataBase has some worng',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    const accessToken = this.LogInUser({
      id: id,
      password: dto.password,
    });
    res.cookie('accessToken', accessToken, {
      expires: new Date(new Date().getTime() + 16 * 60 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    return res.status(201).send('SuccessFul Sign Up');
  }

  LogInUser(LogInDto: LogInUserDto) {
    return this.jwtService.sign({
      id: LogInDto.id,
      password: LogInDto.password,
    });
  }
}
