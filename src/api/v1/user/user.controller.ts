import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { UserService } from './user.service';
import { Request } from 'express';

@Controller('v1/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  @MessagePattern('NB-User:CreateUser')
  createUser(@Body() body, @Req() req: Request) {
    const cookies = req.cookies;
    return this.userService.createUser(body, cookies['accessToken']);
  }

  @HttpCode(200)
  @Get(':username')
  getUser(@Param() params: any) {
    const username = params.username;
    return this.userService.getUser(username);
  }
}
