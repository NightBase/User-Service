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
    const response = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenValid', token),
    );
    if (!response) {
      // If the token is invalid
      return res.status(HttpStatus.UNAUTHORIZED).send({
        message: 'Invalid token',
      }); // Return 401
    }
    next(); // If the token is valid, continue
  }
}
