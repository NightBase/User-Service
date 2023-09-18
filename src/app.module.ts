import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BROKERS } from './utils/constants';

// V1
import { UserController } from './api/v1/account.controller';
import { UserService } from './api/v1/account.service';
// V1 Middleware
import { CheckCredentials } from './api/v1/middleware/account';

// Services
import { ACCOUNT_SERVICE } from './utils/constants';

@Module({
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
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CheckCredentials).forRoutes({
      path: 'v1/user',
      method: RequestMethod.POST,
    });
  }
}
