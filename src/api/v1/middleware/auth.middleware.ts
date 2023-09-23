import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AUTHENTICATION_SERVICE_NAME } from '@/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthRequired implements NestMiddleware {
  constructor(
    @Inject(AUTHENTICATION_SERVICE_NAME)
    private readonly authQueue: ClientProxy,
  ) {}
  async use(req: Request, res: Response, next: NextFunction) {
    // Check if the cookies is presented
    if (!req.cookies) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Cookies does not exist',
        logout: true,
      });
    }

    // Check if the token is presented
    const token = req.cookies['accessToken'];
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Token is required',
        logout: true,
      });
    }

    // Check if the token is valid
    const isValid = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenValid', token),
    );
    if (isValid.status && isValid.status !== HttpStatus.OK) {
      return res.status(isValid.status).send(isValid.response);
    }

    // Check if the token is expired
    const isExpired = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenExpired', token),
    );
    if (isExpired === false) return next();

    // Check if the token is revoked
    const isRevoked = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenRevoked', token),
    );

    if (isRevoked) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Your token is revoked',
        logout: true,
      });
    }

    const refrestToken = req.cookies['refreshToken'];
    if (!refrestToken) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Refresh token is required',
        logout: true,
      });
    }

    const isRefreshed = await lastValueFrom(
      this.authQueue.send('NB-Auth:RefreshToken', refrestToken),
    );

    if (isRefreshed.status && isRefreshed.status !== HttpStatus.OK) {
      return res.status(isRefreshed.status).send(isRefreshed.response);
    }

    res.cookie('accessToken', isRefreshed, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });
    next();
  }
}
