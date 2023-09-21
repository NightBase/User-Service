import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { AccountService } from './account.service';
import { Credentials } from '../Database/Dto/create-account';

@Controller('v1/user')
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  @HttpCode(201)
  createUser(@Body() body) {
    return this.accountService.createUser(body);
  }

  @MessagePattern('Queen:CreateUser')
  async createUserHandler(data: Credentials) {
    return this.accountService.createUser(data);
  }
}
