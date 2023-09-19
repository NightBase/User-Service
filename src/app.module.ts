import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

// Services
import { AccountModule } from './api/v1/account.module';

@Module({
  imports: [
    AccountModule,
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: 'NightBase-User',
      autoLoadModels: true,
      synchronize: true,
      logging: false,
      dialectOptions: {
        application_name: 'NightBase-User',
      },
    }),
  ],
})
export class AppModule {}
