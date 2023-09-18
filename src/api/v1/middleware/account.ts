import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { HTTP_STATUS } from '../../../utils/constants';

interface Credentials {
  username: string;
  password: string;
  email: string;
  isRoot?: string;
}

@Injectable()
export class CheckCredentials implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const body: Credentials = req.body;
    if (!body.username || !body.password || !body.email) {
      return res.status(HTTP_STATUS.BAD_REQUEST).send({
        message: 'Missing credentials',
      });
    }
    if (body.isRoot) {
      try {
        JSON.parse(body.isRoot);
      } catch (e) {
        return res.status(HTTP_STATUS.BAD_REQUEST).send({
          message: 'Invalid value for isRoot',
        });
      }
      next();
    }
  }
}
