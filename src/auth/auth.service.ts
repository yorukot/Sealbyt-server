import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthDto, SingUpDto } from './dto';
import { JwtService } from '@nestjs/jwt';
import generateUserId from 'src/function/generate/GenerateUserid';
import { Request, Response } from 'express';
import JwtVerifyToken from 'src/function/verify/JwtVerify';
import FindUsersByEmail from 'src/DataBase/function/Find/users/FindByEmail';
import FindUsersByName from 'src/DataBase/function/Find/users/FindByName';
import createUsersData from 'src/DataBase/function/Create/users/createdata';
import validateUsername from 'src/function/verify/UserNameVerify';
import CreateRefreshToken from 'src/DataBase/function/Create/key/CreateRefreshToken';
import FindRefreshToken from 'src/DataBase/function/Find/key/FindRefreshToken';
import DeleteRefreshToken from 'src/DataBase/function/Delete/key/DeleteRefreshToken';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(private jwtService: JwtService) {}

  async LogInLocal(dto: AuthDto, ip: string, req: Request, res: Response) {
    //確認使用者的帳密資訊是否打對
    const user = await FindUsersByEmail(dto.email);
    if (!user || user.password !== dto.password)
      throw new UnauthorizedException('User or password does not exist');
    //設定新的cookies
    const accessToken = this.LogInUser(user.id);
    const refresh_token = await this.NewRefreshToken(user.id);
    res.cookie('accessToken', accessToken, {
      expires: new Date(new Date().getTime() + 15 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    res.cookie('refreshToken', refresh_token, {
      expires: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    //紀錄
    this.logger.log(`${user.id}(${user.name}) logged in`);
    return res.status(200).send('SuccessFul Log In');
  }

  async SignUpLocal(dto: SingUpDto, req: Request, res: Response) {
    //檢查name是否符合規定
    if (!validateUsername(dto.name))
      throw new BadRequestException(
        'Use only letters, numbers, dot and underscores',
      );
    //檢查名稱是否有被註冊過
    const user_name_has_been_use = await FindUsersByName(dto.name);
    if (user_name_has_been_use)
      throw new UnauthorizedException('User name has been use');
    //檢查email是否有被註冊過
    const user_eail_has_been_use = await FindUsersByEmail(dto.email);
    if (user_eail_has_been_use)
      throw new UnauthorizedException('User email has been use');
    //創建新的id
    const id = generateUserId();
    //創建新的使用者
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
    //設定cookies
    const accessToken = this.LogInUser(id);
    const refresh_token = await this.NewRefreshToken(id);
    res.cookie('refreshToken', refresh_token, {
      expires: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    res.cookie('accessToken', accessToken, {
      expires: new Date(new Date().getTime() + 15 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    //紀錄
    this.logger.log(`${id}(${dto.name}) sign up`);
    return res.status(201).send('SuccessFul Sign Up');
  }

  async RefreshToken(req: Request, res: Response) {
    //驗證token是否正確
    const Jwt_data = JwtVerifyToken(req.cookies.refreshToken);
    if (!Jwt_data) throw new UnauthorizedException('Unauthorized');
    //找到他的refreshtoken，如果refreshtoken找不到的話
    const refresh_token_data = await FindRefreshToken(req.cookies.refreshToken);
    //可能未來改成電子郵件通知
    if (!refresh_token_data) throw new UnauthorizedException('Unauthorizedaaa');
    //如果只是單存的太久沒上線
    if (Date.now() - refresh_token_data.craete_at > 5184000000)
      throw new UnauthorizedException('Unauthorized');
    //創建新的accessToken
    const accessToken = this.LogInUser(Jwt_data.id);
    //創建新的refreshToken
    const new_refresh_token = await this.NewRefreshToken(
      Jwt_data.id,
      req.cookies.refreshToken,
    );
    //設定新的refreshtoken
    res.cookie('refreshToken', new_refresh_token, {
      expires: new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    //設定新的accessToken
    res.cookie('accessToken', accessToken, {
      expires: new Date(new Date().getTime() + 15 * 60 * 1000),
      sameSite: 'strict',
      httpOnly: true,
    });
    res.status(200).send('SuccessFul Refresh Token');
  }

  hasPermission(req: Request, res: Response) {
    const Jwt_data = JwtVerifyToken(req.cookies.accessToken);
    if (!Jwt_data)
      throw new UnauthorizedException('User does not have permission');
    if (Jwt_data.expires - Date.now() < 5 * 60 * 1000)
      return res.status(205).send('Permission granted, but about to expire');
    return res.status(200).send('Permission granted');
  }

  LogInUser(id: string) {
    //返回jwt_token
    return this.jwtService.sign(
      {
        id: id,
      },
      {
        expiresIn: '15m',
      },
    );
  }

  async NewRefreshToken(id: string, old_refresh_token?: string | null) {
    //如果有填寫old_refresh_token的話就刪除舊的refresh_token
    if (old_refresh_token) {
      await DeleteRefreshToken(old_refresh_token);
    }
    //創建新的refreh_token
    const new_refresh_token = this.jwtService.sign(
      {
        id: id,
        refresh: true,
      },
      {
        expiresIn: '60d',
      },
    );
    //寫入資料庫
    await CreateRefreshToken(new_refresh_token);
    //返回新的refresh_token
    return new_refresh_token;
  }
}

/*
0=離線
1=在線
2=休息
3=請勿打擾
*/
