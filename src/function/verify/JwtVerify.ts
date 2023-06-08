import * as jwt from 'jsonwebtoken';
import { JwtDto } from './Jwt.dto';

export default function JwtVerifyToken(token: string) {
  const secret_key = process.env.JWT_SECRET_KEY;
  try {
    const jwt_data: JwtDto = jwt.verify(token, secret_key) as JwtDto;
    return jwt_data;
  } catch (error) {
    return false;
  }
}
