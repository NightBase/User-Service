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
    // Check if the token is presented
    if (!req.headers.authorization) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'You have to login to perform this action',
      });
    }

    // Check if the token is bearer
    const [type, token] = req.headers.authorization.split(' ');
    if (type !== 'Bearer') {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'You must use bearer token to perform this action',
      });
    }

    // Check if the token is valid
    const isValid = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenValid', token),
    );
    console.log('is valid', isValid);
    if (isValid.status && isValid.status !== HttpStatus.OK) {
      return res.status(isValid.status).send(isValid.response);
    }

    // Check if the token is expired
    const isExpired = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenExpired', token),
    );
    console.log('is expired', isExpired);
    if (isExpired === false) return next();

    // Check if the token is revoked
    const isRevoked = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenRevoked', token),
    );
    console.log('is revoked', isRevoked);

    if (isRevoked) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Your token is revoked',
        logout: true,
      });
    }

    if (!req.cookies) {
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Cookies does not exist',
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

    res.setHeader('Authorization', `Bearer ${isRefreshed}`);
    console.log('refresh token', isRefreshed);
    next();
  }
}
