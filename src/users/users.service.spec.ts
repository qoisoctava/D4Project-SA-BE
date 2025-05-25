import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;

  // Mock user data
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

  const mockCreateUserDto: CreateUserDto = {
    username: 'newuser',
    email: 'newuser@example.com',
    password: 'password123',
    role: UserRole.VIEWER,
  };

  beforeEach(async () => {
    // Create a mock repository
    const mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get(getRepositoryToken(User));

    // Setup bcrypt mocks
    mockedBcrypt.genSalt.mockResolvedValue('salt' as never);
    mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
    mockedBcrypt.compare.mockResolvedValue(true as never);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null); // No existing user
      repository.create.mockReturnValue(mockUser);
      repository.save.mockResolvedValue(mockUser);

      // Act
      const result = await service.create(mockCreateUserDto);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: [
          { email: mockCreateUserDto.email },
          { username: mockCreateUserDto.username },
        ],
      });
      expect(mockedBcrypt.genSalt).toHaveBeenCalled();
      expect(mockedBcrypt.hash).toHaveBeenCalledWith(mockCreateUserDto.password, 'salt');
      expect(repository.create).toHaveBeenCalledWith({
        ...mockCreateUserDto,
        password: 'hashedpassword',
      });
      expect(repository.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when user already exists', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockUser); // Existing user found

      // Act & Assert
      await expect(service.create(mockCreateUserDto)).rejects.toThrow(
        new ConflictException('User with this email or username already exists')
      );
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      // Arrange
      const expectedUsers = [mockUser];
      repository.find.mockResolvedValue(expectedUsers);

      // Act
      const result = await service.findAll();

      // Assert
      expect(repository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedUsers);
    });
  });

  describe('findOne', () => {
    it('should return a user when found', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne(mockUser.id);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        new NotFoundException('User with ID "nonexistent-id" not found')
      );
    });
  });

  describe('findByUsername', () => {
    it('should return a user when found', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(mockUser);

      // Act
      const result = await service.findByUsername(mockUser.username);

      // Assert
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: mockUser.username },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      // Arrange
      repository.findOne.mockResolvedValue(null);

      // Act
      const result = await service.findByUsername('nonexistent');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = {
      email: 'updated@example.com',
      username: 'updateduser',
    };

    it('should successfully update a user', async () => {
      // Arrange
      const updatedUser = { ...mockUser, ...updateDto };
      repository.findOne.mockResolvedValueOnce(mockUser); // For findOne in update method
      repository.findOne.mockResolvedValueOnce(null); // For email check
      repository.findOne.mockResolvedValueOnce(null); // For username check
      repository.save.mockResolvedValue(updatedUser);

      // Act
      const result = await service.update(mockUser.id, updateDto);

      // Assert
      expect(repository.save).toHaveBeenCalled();
      expect(result.email).toBe(updateDto.email);
      expect(result.username).toBe(updateDto.username);
    });

    it('should throw ConflictException when email already exists', async () => {
      // Arrange
      repository.findOne.mockResolvedValueOnce(mockUser); // For findOne in update method
      repository.findOne.mockResolvedValueOnce(mockUser); // Email already exists

      // Act & Assert
      await expect(service.update(mockUser.id, updateDto)).rejects.toThrow(
        new ConflictException('User with this email already exists')
      );
    });
  });

  describe('remove', () => {
    it('should successfully delete a user', async () => {
      // Arrange
      repository.delete.mockResolvedValue({ affected: 1, raw: {} });

      // Act
      await service.remove(mockUser.id);

      // Assert
      expect(repository.delete).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      repository.delete.mockResolvedValue({ affected: 0, raw: {} });

      // Act & Assert
      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        new NotFoundException('User with ID "nonexistent-id" not found')
      );
    });
  });
});