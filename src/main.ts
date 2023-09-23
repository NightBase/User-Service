import dotenv from 'dotenv';
import { AppModule } from './app.module';
import { BROKERS, ACCOUNT_QUEUE_NAME } from './utils/constants';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: BROKERS,
      queue: ACCOUNT_QUEUE_NAME,
      queueOptions: {
        durable: false,
      },
    },
  });
  app.enableCors();
  app.use(cookieParser());
  await app.startAllMicroservices();
  await app.listen(process.env.PORT || 5000);
  console.log(`🚀 User service is running on: ${await app.getUrl()}`);
}
bootstrap();
