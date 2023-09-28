import {
  AUTHENTICATION_QUEUE_NAME,
  AUTHENTICATION_SERVICE_NAME,
  BROKERS,
} from '@/utils/constants';
import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SequelizeModule } from '@nestjs/sequelize';

import { User } from '../../common/Database/Models/user.model';
import { UserCreateService } from './create/create.service';
import { UserDeleteService } from './delete/delete.service';
import { UserGetService } from './get/get.service';
import { UserController } from './user.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: AUTHENTICATION_SERVICE_NAME,
        transport: Transport.RMQ,
        options: {
          urls: BROKERS,
          queue: AUTHENTICATION_QUEUE_NAME,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    SequelizeModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserCreateService, UserGetService, UserDeleteService],
})
export class UserModule {}
