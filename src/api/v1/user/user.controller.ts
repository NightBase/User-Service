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
import { UserCreateService } from './create/create.service';
import { Request } from 'express';
import { UserGetService } from './get/get.service';

@Controller('v1/user')
export class UserController {
  constructor(
    private readonly userCreateService: UserCreateService,
    private readonly userGetService: UserGetService,
  ) {}

  @Post()
  @HttpCode(201)
  @MessagePattern('NB-User:CreateUser')
  createUser(@Body() body, @Req() req: Request) {
    const cookies = req.cookies;
    return this.userCreateService.createUser(body, cookies['accessToken']);
  }

  @Get('@me')
  @HttpCode(200)
  getMe(@Req() req: Request) {
    const cookies = req.cookies;
    return this.userGetService.getMe(cookies['accessToken']);
  }

  @HttpCode(200)
  @Get(':username')
  getUser(@Param() params: any) {
    const username = params.username;
    return this.userGetService.getUser(username);
  }
}
