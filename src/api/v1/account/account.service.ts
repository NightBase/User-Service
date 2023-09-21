import { InjectModel } from '@nestjs/sequelize';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  ACCOUNT_SERVICE_NAME,
  AUTHENTICATION_SERVICE_NAME,
} from '@/utils/constants';
import { User } from '../Database/Models/user.model';
import { Credentials } from '../Database/Dto/create-account';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AccountService {
  constructor(
    @Inject(ACCOUNT_SERVICE_NAME)
    private readonly accountQueue: ClientProxy,
    @Inject(AUTHENTICATION_SERVICE_NAME)
    private readonly authQueue: ClientProxy,
    @InjectModel(User) private UserModel: typeof User,
  ) {}

  async createUser(data: Credentials) {
    const authData = await lastValueFrom(
      this.authQueue.send('Pawn:CreateAccount', data),
    );
    let isSuccess = false;
    try {
      isSuccess = JSON.parse(authData.success);
    } catch {
      isSuccess = false;
    }

    if (!isSuccess) {
      return {
        success: isSuccess,
        data: authData,
      };
    }

    try {
      await this.UserModel.create({
        username: authData.username,
        email: authData.email,
        isRoot: authData.isRoot,
      });
    } catch (err) {
      console.log(err);
    }

    return {
      success: isSuccess,
      data: authData,
    };
  }
}
