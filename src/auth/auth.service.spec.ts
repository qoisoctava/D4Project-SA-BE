import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { User, UserRole } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: User = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: UserRole.VIEWER,
    twitterHistories: [],
    youtubeHistories: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockUsersService = {
      findByUsername: jest.fn(),
      create: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user data when credentials are valid', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      // Act
      const result = await service.validateUser(mockUser.username, 'password123');

      // Assert
      expect(usersService.findByUsername).toHaveBeenCalledWith(mockUser.username);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
        twitterHistories: mockUser.twitterHistories,
        youtubeHistories: mockUser.youtubeHistories,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
      expect(result.password).toBeUndefined();
    });

    it('should return null when user is not found', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(null);

      // Act
      const result = await service.validateUser('nonexistent', 'password123');

      // Assert
      expect(result).toBeNull();
      expect(mockedBcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password is invalid', async () => {
      // Arrange
      usersService.findByUsername.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      // Act
      const result = await service.validateUser(mockUser.username, 'wrongpassword');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access token and user data', async () => {
      // Arrange
      const mockToken = 'mock.jwt.token';
      jwtService.sign.mockReturnValue(mockToken);
      const userWithoutPassword = {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role,
      };

      // Act
      const result = await service.login(userWithoutPassword);

      // Assert
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: mockUser.username,
        sub: mockUser.id,
        role: mockUser.role,
      });
      expect(result).toEqual({
        access_token: mockToken,
        user: userWithoutPassword,
      });
    });
  });

  describe('register', () => {
    it('should create a new user and return user data without password', async () => {
      // Arrange
      const createUserDto: CreateUserDto = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: UserRole.VIEWER,
      };
      usersService.create.mockResolvedValue(mockUser);

      // Act
      const result = await service.register(createUserDto);

      // Assert
      expect(usersService.create).toHaveBeenCalledWith(createUserDto);
      expect(result.password).toBeUndefined();
      expect(result.id).toBe(mockUser.id);
      expect(result.username).toBe(mockUser.username);
      expect(result.email).toBe(mockUser.email);
      expect(result.role).toBe(mockUser.role);
    });
  });
});