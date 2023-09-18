import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

// V1
import { UserController } from './api/v1/user.controller';
import { UserService } from './api/v1/user.service';
// V1 Middleware
import { CheckCredentials } from './api/v1/middleware/account';

// Services
import { USER_SERVICE } from './utils/constants';

@Module({
  imports: [
    ClientsModule.register([{ name: USER_SERVICE, transport: Transport.TCP }]),
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
