import { Body, Controller, HttpCode, Inject, Post } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ACCOUNT_SERVICE_NAME } from '@/utils/constants';
import { AccountService } from './account.service';

@Controller('v1/user')
export class AccountController {
  constructor(
    @Inject(ACCOUNT_SERVICE_NAME) private readonly accountQueue: ClientProxy,
    private readonly accountService: AccountService,
  ) {}

  @Post()
  @HttpCode(201)
  createUser(@Body() body) {
    return this.accountService.createUser(body);
  }

  @MessagePattern({ cmd: 'createUser' })
  async createUserHandler(@Body() body) {
    return this.accountService.createUser(body);
  }
}
