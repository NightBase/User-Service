import { lastValueFrom } from 'rxjs';

import { AUTHENTICATION_SERVICE_NAME } from '@/utils/constants';
import { HttpException, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/sequelize';

import { User } from '../../../common/Database/Models/user.model';

@Injectable()
export class UserDeleteService {
  constructor(
    @Inject(AUTHENTICATION_SERVICE_NAME)
    private readonly authQueue: ClientProxy,
    @InjectModel(User) private UserModel: typeof User,
  ) {}

  async deleteUser(username: string, accessToken: string) {
    const deleteAccount = await lastValueFrom(
      this.authQueue.send('NB-Auth:DeleteAccount', {
        identifier: username,
        accessToken,
      }),
    );

    if (deleteAccount.status && deleteAccount.status !== 200) {
      throw new HttpException(
        {
          message: deleteAccount.message,
        },
        deleteAccount.status,
      );
    }

    await this.UserModel.destroy({
      where: {
        username,
      },
    });

    return {
      message: 'User deleted successfully',
    };
  }
}
