import * as jwt from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY; // 替換為實際的密鑰
export default function JwtRoomVerifyToken(Token: string, Room: string) {
  try {
    jwt.verify(Token, secretKey);
    return true;
  } catch (error) {
    return false;
  }
}
