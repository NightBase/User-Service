import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { USER_SERVICE } from '../../utils/constants';

@Injectable()
export class UserService {
  constructor(
    @Inject(USER_SERVICE) private readonly user_service: ClientProxy,
  ) {}

  createUser(data: any) {
    return {
      data,
    };
  }
}
