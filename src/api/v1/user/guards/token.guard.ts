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
