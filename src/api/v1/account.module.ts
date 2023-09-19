import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ACCOUNT_SERVICE, BROKERS } from '@/utils/constants';

// V1
import { AccountController } from './account.controller';
import { AccountService } from './account.service';

// V1 Middleware
import {
  CheckAccountExists,
  CheckCredentials,
  CheckRootAccount,
} from './middleware/create.guard';

// Models
import { Account } from './Database/Models/account.model';

@Module({
  // imports: [SequelizeModule.forFeature([Account])],
  imports: [
    ClientsModule.register([
      {
        name: ACCOUNT_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: BROKERS,
          queue: 'user_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    SequelizeModule.forFeature([Account]),
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

    consumer.apply(CheckAccountExists).forRoutes({
      path: 'v1/user',
      method: RequestMethod.POST,
    });

    consumer.apply(CheckRootAccount).forRoutes({
      path: 'v1/user',
      method: RequestMethod.POST,
    });
  }
}
