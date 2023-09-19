import { Op } from 'sequelize';

import { Account } from '../Database/Models/account.model';

import { HttpStatus, Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Credentials } from '../Database/Dto/create-account';
import { AUTHENTICATION_SERVICE_NAME } from '@/utils/constants';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class CheckCredentials implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const body: Credentials = req.body;
    if (!body.username || !body.password || !body.email) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: 'Missing credentials',
      });
    }
    if (body.isRoot) {
      try {
        JSON.parse(body.isRoot);
      } catch (e) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          message: 'Invalid value for isRoot',
        });
      }
    } else {
      body.isRoot = 'false';
    }

    next();
  }
}

@Injectable()
export class CheckAccountExists implements NestMiddleware {
  async use(req: any, res: any, next: (error?: any) => void) {
    const { username, email } = req.body;
    const acc = await Account.findOne({
      where: {
        [Op.or]: [{ username }, { email }],
      },
    });
    if (acc) {
      return res.status(HttpStatus.BAD_REQUEST).send({
        message: 'Account already exists',
      });
    }
    next();
  }
}

@Injectable()
export class CheckRootAccount implements NestMiddleware {
  async use(req: any, res: any, next: (error?: any) => void) {
    const { isRoot } = req.body;
    if (isRoot === 'true') {
      const acc = await Account.findOne({ where: { isRoot: true } });
      if (acc) {
        return res.status(HttpStatus.BAD_REQUEST).send({
          message: 'Cannot create root account',
        });
      }
    }
    next();
  }
}

@Injectable()
export class AuthRequired implements NestMiddleware {
  constructor(
    @Inject(AUTHENTICATION_SERVICE_NAME)
    private readonly authQueue: ClientProxy,
  ) {}

  async use(req: Request, res: Response, next: (error?: NextFunction) => void) {
    const { isRoot } = req.body;
    const token = this.extractToken(req);
    if (isRoot === 'false') {
      if (!token) {
        return res.status(HttpStatus.UNAUTHORIZED).send({
          message: 'You must be logged in to perform this action',
        });
      }

      const isValid = await lastValueFrom(
        this.authQueue.send({ cmd: 'isTokenValid' }, token),
      );

      if (!isValid) {
        return res.status(HttpStatus.UNAUTHORIZED).send({
          message: 'Token is invalid',
        });
      }
    }
    next();
  }

  private extractToken(req: Request) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    return token;
  }
}
