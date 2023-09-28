import { lastValueFrom } from 'rxjs';

import { AUTHENTICATION_SERVICE_NAME } from '@/utils/constants';
import {
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';

import { Credentials } from '../../../common/Database/Dto/create-account';
import { User } from '../../../common/Database/Models/user.model';

@Injectable()
export class UserCreateService {
  constructor(
    @Inject(AUTHENTICATION_SERVICE_NAME)
    private readonly authQueue: ClientProxy,
    @InjectModel(User) private UserModel: typeof User,
  ) {}

  async createUser(@Body() body, accessToken: string) {
    const data = body as Credentials;
    const authData: any = await lastValueFrom(
      this.authQueue.send('NB-Auth:CreateAccount', { data, accessToken }),
    );
    const status = authData.status;
    const message = authData.response;

    if (status !== HttpStatus.CREATED) {
      throw new HttpException(message, status);
    }

    await this.UserModel.create({
      email: authData.email,
      username: authData.username,
      isRoot: authData.isRoot,
    });

    return { message: authData.message };
  }
}
