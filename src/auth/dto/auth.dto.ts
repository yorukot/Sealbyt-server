import { IsEmail, IsNumber, IsString, ValidateIf } from 'class-validator';

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
  password: string;
}

export class SingUpDto {
  @IsEmail()
  email: string;
  @IsString()
  password: string;
  @IsString()
  name: string;
  @IsNumber()
  @ValidateIf((object, value) => value !== null)
  twofactor: string = null;
}

export class TokenDto {
  @IsString()
  Token: string;
  @IsString()
  @ValidateIf((object, value) => value !== null)
  Room: string = null;
}
