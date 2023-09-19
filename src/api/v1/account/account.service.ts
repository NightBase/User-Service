import { createHash } from 'crypto';
import { InjectModel } from '@nestjs/sequelize';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ACCOUNT_SERVICE_NAME } from '@/utils/constants';
import { Account } from '../Database/Models/account.model';
import { Credentials } from '../Database/Dto/create-account';

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_SERVICE_NAME)
    private readonly accountQueue: ClientProxy,
    @InjectModel(Account) private account_model: typeof Account,
  ) {}

  createUser(data: Credentials) {
    const hash = createHash('sha256');
    hash.update(data.password);
    data.password = hash.digest('hex');

    this.account_model.create({
      username: data.username,
      password: data.password,
      email: data.email,
      isRoot: data.isRoot,
    });

    return {
      message: 'Account created successfully',
    };
  }
}
