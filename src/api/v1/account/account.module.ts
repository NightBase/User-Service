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
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

// V1 Middleware
import { CheckCredentials } from '../middleware/create.guard';

// Models
import { User } from '../Database/Models/user.model';
import { Permission, Role } from '../Database/Models/role.model';
import { Database } from '../Database/Models/database.model';

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
    SequelizeModule.forFeature([User, Permission, Role, Database]),
  ],
  controllers: [AccountController],
  providers: [AccountService],
})
export class AccountModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckCredentials).forRoutes({
      path: 'v1/user',
      method: RequestMethod.POST,
    });
  }
}
