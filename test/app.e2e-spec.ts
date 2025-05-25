import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../src/users/entities/user.entity';
import { Repository } from 'typeorm';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    userRepository = moduleFixture.get<Repository<User>>(getRepositoryToken(User));
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Clean up database before each test
    await userRepository.clear();
  });

  describe('/auth/register (POST)', () => {
    it('should register a new user', () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.username).toBe(createUserDto.username);
          expect(res.body.email).toBe(createUserDto.email);
          expect(res.body.password).toBeUndefined();
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 400 for invalid input', () => {
      const invalidDto = {
        username: '',
        email: 'invalid-email',
        password: '123', // Too short
      };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(invalidDto)
        .expect(400);
    });

    it('should return 409 for duplicate user', async () => {
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      // Create first user
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto)
        .expect(201);

      // Attempt to create duplicate
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto)
        .expect(409);
    });
  });

  describe('/auth/login (POST)', () => {
    beforeEach(async () => {
      // Create a test user
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto);
    });

    it('should login with valid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.username).toBe('testuser');
          expect(res.body.user.password).toBeUndefined();
        });
    });

    it('should return 401 for invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'wrongpassword',
        })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    let authToken: string;

    beforeEach(async () => {
      // Create and login a test user
      const createUserDto = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      };

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(createUserDto);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          username: 'testuser',
          password: 'password123',
        });

      authToken = loginResponse.body.access_token;
    });

    it('should return user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.username).toBe('testuser');
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.id).toBeDefined();
        });
    });

    it('should return 401 without token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token.here')
        .expect(401);
    });
  });
});