import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;
const EXPIRE = process.env.JWT_EXPIRE || '7d';

export const signToken = (payload: { id: string; role: string }): string => {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRE } as jwt.SignOptions);
};

export const verifyToken = (token: string): jwt.JwtPayload => {
  return jwt.verify(token, SECRET) as jwt.JwtPayload;
};
