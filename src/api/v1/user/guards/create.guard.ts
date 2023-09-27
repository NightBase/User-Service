import { Observable } from 'rxjs';

import { Credentials } from '@/api/common/Database/Dto/create-account';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

export class CheckCredentials implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const body: Credentials = request.body;
    if (!body.username || !body.password || !body.email) {
      throw new HttpException(
        {
          message: 'Missing credentials',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
    return true;
  }
}
