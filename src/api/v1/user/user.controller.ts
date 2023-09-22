import { Body, Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';
import { Credentials } from '../Database/Dto/create-account';

@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  createUser(@Body() body) {
    return this.userService.createUser(body);
  }

  @HttpCode(200)
  @Get(':username')
  getUser(@Param() params: any) {
    const username = params.username;
    return this.userService.getUser(username);
  }

  @MessagePattern('NB-User:CreateUser')
  async createUserHandler(data: Credentials) {
    return this.userService.createUser(data);
  }
}
