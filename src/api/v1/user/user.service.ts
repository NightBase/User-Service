import { InjectModel } from '@nestjs/sequelize';
import {
  Body,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTHENTICATION_SERVICE_NAME } from '@/utils/constants';
import { User } from '../Database/Models/user.model';
import { Credentials } from '../Database/Dto/create-account';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UserService {
  constructor(
    @Inject(AUTHENTICATION_SERVICE_NAME)
    private readonly authQueue: ClientProxy,
    @InjectModel(User) private UserModel: typeof User,
  ) {}

  async createUser(@Body() body, accessToken: string) {
    const data = body as Credentials;
    const authData = await lastValueFrom(
      this.authQueue.send('NB-Auth:CreateAccount', { data, accessToken }),
    );
    const status = authData.status;
    const message = authData.message;

    if (status !== HttpStatus.CREATED) {
      throw new HttpException(
        {
          message,
        },
        status,
      );
    }

    await this.UserModel.create({
      email: authData.email,
      username: authData.username,
      isRoot: authData.isRoot,
    });

    return {
      message,
    };
  }

  async getUser(username: string) {
    const user = await this.UserModel.findOne({
      where: {
        username,
      },
      attributes: { exclude: ['id'] },
    });

    if (!user) {
      throw new HttpException(
        {
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    return user;
  }
}
