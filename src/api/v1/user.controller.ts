import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy, MessagePattern } from '@nestjs/microservices';
import { USER_SERVICE } from '../../utils/constants';
import { UserService } from './user.service';

@Controller('v1/user')
export class UserController {
  constructor(
    @Inject(USER_SERVICE) private readonly user_service: ClientProxy,
    private readonly userService: UserService,
  ) {}

  @Post()
  createUser(@Body() body) {
    return this.user_service.send({ cmd: 'createUser' }, body);
  }

  @MessagePattern({ cmd: 'createUser' })
  async createUserHandler(@Body() body) {
    return this.userService.createUser(body);
  }
}
