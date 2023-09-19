import { Op } from 'sequelize';
import { HTTP_STATUS } from '@/utils/constants';

import { Account } from '../Database/Models/account.model';

import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Credentials } from '../Database/Dto/create-account';

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
      return res.status(HTTP_STATUS.BAD_REQUEST).send({
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
        return res.status(HTTP_STATUS.BAD_REQUEST).send({
          message: 'Cannot create root account',
        });
      }
    }
    next();
  }
}
