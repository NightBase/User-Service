import { InjectModel } from '@nestjs/sequelize';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTHENTICATION_SERVICE_NAME } from '@/utils/constants';
import { User } from '../../../common/Database/Models/user.model';

@Injectable()
export class UserGetService {
  constructor(
    @Inject(AUTHENTICATION_SERVICE_NAME)
    private readonly authQueue: ClientProxy,
    @InjectModel(User) private UserModel: typeof User,
  ) {}

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