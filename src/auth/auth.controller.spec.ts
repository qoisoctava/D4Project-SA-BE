import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UserRole } from '../users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@example.com',
    role: UserRole.VIEWER,
  };

  const mockLoginResponse = {
    access_token: 'mock.jwt.token',
    user: mockUser,
  };

  beforeEach(async () => {
    const mockAuthService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: UserRole.VIEWER,
      };
      authService.register.mockResolvedValue(mockUser);

      // Act
      const result = await controller.register(createUserDto);

      // Assert
      expect(authService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should login a user and return JWT token', async () => {
      // Arrange
      const mockRequest = { user: mockUser };
      authService.login.mockResolvedValue(mockLoginResponse);

      // Act
      const result = await controller.login(mockRequest);

      // Assert
      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', () => {
      // Arrange
      const mockRequest = { user: mockUser };

      // Act
      const result = controller.getProfile(mockRequest);

      // Assert
      expect(result).toEqual(mockUser);
    });
  });
});