export interface JwtPayload {
  userId: string;
  role: 'doctor' | 'patient' | 'insurer' | 'admin';
  email: string;
  name: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
