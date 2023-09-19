import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { ACCOUNT_SERVICE } from '@/utils/constants';
import { AccountService } from './account.service';

@Controller('v1/user')
export class AccountController {
  constructor(
    @Inject(ACCOUNT_SERVICE) private readonly user_service: ClientProxy,
    private readonly accountService: AccountService,
  ) {}

  @Post()
  createUser(@Body() body) {
    return this.user_service.send({ cmd: 'createUser' }, body);
  }

  @MessagePattern({ cmd: 'createUser' })
  async createUserHandler(@Body() body) {
    return this.accountService.createUser(body);
  }
}
