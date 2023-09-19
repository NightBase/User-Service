import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('User Service V1', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('[POST] Create User Without Credentials', () => {
    return request(app.getHttpServer()).post('/v1/user').expect(400);
  });

  afterAll(async () => {
    await app.close();
  });
});
