import { lastValueFrom, Observable } from 'rxjs';

import { AUTHENTICATION_SERVICE_NAME } from '@/utils/constants';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

export class CookieGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    if (
      request.cookies &&
      (!request.cookies['accessToken'] || !request.cookies['refreshToken'])
    ) {
      throw new HttpException(
        {
          message: 'Cookies do not exist',
          logout: true,
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }
}

export class TokenRefreshGuard implements CanActivate {
  constructor(
    @Inject(AUTHENTICATION_SERVICE_NAME)
    private readonly authQueue: ClientProxy,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const accessToken = request.cookies['accessToken'];

    await this.isTokenValid(accessToken);
    const isExpired = await this.isTokenExpired(accessToken);
    if (!isExpired) return true;

    const refreshToken = request.cookies['refreshToken'];
    const newToken = await this.refreshToken(refreshToken);

    request.cookies['accessToken'] = newToken;
    response.cookie('accessToken', newToken, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: true,
    });

    return true;
  }

  async isTokenValid(token: string) {
    const isValid = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenValid', token),
    );
    if (!isValid) {
      throw new HttpException(
        {
          message: 'Token is invalid',
          logout: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return isValid;
  }

  async isTokenExpired(token: string) {
    const isExpired = await lastValueFrom(
      this.authQueue.send('NB-Auth:IsTokenExpired', token),
    );
    return isExpired;
  }

  async refreshToken(refreshToken: string) {
    const token = await lastValueFrom(
      this.authQueue.send('NB-Auth:RefreshToken', refreshToken),
    );
    if (!token) {
      throw new HttpException(
        {
          message: 'Token is invalid',
          logout: true,
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return token;
  }
}
