import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user with the same email or username already exists
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User with this email or username already exists');
    }

    // Hash the password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // Create new user
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Save the user to the database
    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ 
      where: { id: id } // Explicitly cast to satisfy TypeScript
    });
    
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
    
    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ 
      where: { username: username } 
    });
    
    return user; // This can be null, which is fine for this method
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    
    // Check for unique constraints if email or username is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUserWithEmail = await this.usersRepository.findOne({
        where: { email: updateUserDto.email }
      });
      if (existingUserWithEmail) {
        throw new ConflictException('User with this email already exists');
      }
    }

    if (updateUserDto.username && updateUserDto.username !== user.username) {
      const existingUserWithUsername = await this.usersRepository.findOne({
        where: { username: updateUserDto.username }
      });
      if (existingUserWithUsername) {
        throw new ConflictException('User with this username already exists');
      }
    }
    
    // Update user properties
    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    
    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }
    
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      user.password = await bcrypt.hash(updateUserDto.password, salt);
    }
    
    if (updateUserDto.role) {
      user.role = updateUserDto.role as UserRole;
    }
    
    // Save updated user
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }
  }
}