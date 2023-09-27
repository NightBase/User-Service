import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SequelizeModule } from '@nestjs/sequelize';

import { UserModule } from './api/v1/user/user.module';
import { DATABASE_NAME } from './utils/constants';

@Module({
  imports: [
    UserModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: DATABASE_NAME,
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      pool: {
        max: 10,
        min: 0,
        idle: 10000,
      },
      dialectOptions: {
        application_name: 'NightBase-UserService',
      },
    }),
    JwtModule.register({
      global: true,
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '10m' },
    }),
  ],
})
export class AppModule {}
