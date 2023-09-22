import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientsModule, Transport } from '@nestjs/microservices';
import {
  ACCOUNT_SERVICE_NAME,
  BROKERS,
  ACCOUNT_QUEUE_NAME,
  AUTHENTICATION_SERVICE_NAME,
  AUTHENTICATION_QUEUE_NAME,
} from '@/utils/constants';

// V1
import { UserController } from './user.controller';
import { UserService } from './user.service';

// V1 Middleware
import { CheckCredentials } from '../middleware/create.middleware';

// Models
import { User } from '../Database/Models/user.model';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: ACCOUNT_SERVICE_NAME,
        transport: Transport.RMQ,
        options: {
          urls: BROKERS,
          queue: ACCOUNT_QUEUE_NAME,
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
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
  providers: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckCredentials).forRoutes({
      path: 'v1/user',
      method: RequestMethod.POST,
    });
  }
}
