import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './models/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './models/user.interface';
import { UserDto } from './models/user.dto';

@Injectable()
export class AuthService {
  @InjectRepository(UserEntity)
  private readonly userRepository: Repository<UserEntity>;
  constructor() {}

  async create(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async findOneBy(condition): Promise<User> {
    return await this.userRepository.findOne(condition);
  }
}
