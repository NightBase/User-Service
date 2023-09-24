import { HttpStatus, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Credentials } from '../../common/Database/Dto/create-account';

@Injectable()
export class CheckCredentials implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const body: Credentials = req.body;
    if (!body.username || !body.password || !body.email) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: 'Missing credentials',
      });
    }
    next();
  }
}
