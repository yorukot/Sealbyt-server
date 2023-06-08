import { IsEmail, IsString, ValidateIf } from 'class-validator';

export class AuthDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
}

export class LogInUserDto {
  @IsString()
  id: string;
  @IsString()
  name: string;
  @IsString()
  password: string;
}

export class SingUpDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  name: string;
}

export class TokenDto {
  @IsString()
  token: string;
  @IsString()
  @ValidateIf((object, value) => value !== null)
  room: string = null;
}
