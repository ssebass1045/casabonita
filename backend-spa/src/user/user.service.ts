// File: backend-spa/src/user/user.service.ts
import { Injectable, NotFoundException, BadRequestException, OnModuleInit, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService implements OnModuleInit {
  private readonly saltRounds = 10;

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
    const adminExists = await this.userRepository.findOne({ where: { username: adminUsername } });

    if (!adminExists) {
      console.log(`Creando usuario administrador inicial: ${adminUsername}`);
      const adminPassword = process.env.ADMIN_PASSWORD ?? 'password123';
      if (!adminPassword) {
          throw new Error('ADMIN_PASSWORD no está definida en las variables de entorno.');
      }
      const hashedPassword = await bcrypt.hash(adminPassword, this.saltRounds);
      const adminUser = this.userRepository.create({
        username: adminUsername,
        password: hashedPassword,
        role: UserRole.ADMIN,
      });
      await this.userRepository.save(adminUser);
      console.log('Usuario administrador creado.');
    }
  }

  // --- MÉTODO create CORREGIDO ---
  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, this.saltRounds);
    const newUser = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(newUser);
    
    // Desestructurar para omitir la contraseña
    const { password, ...result } = savedUser;
    return result;
  }

  // --- MÉTODO findAll (ya estaba bien) ---
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return users.map(({ password, ...user }) => user);
  }

  // --- MÉTODO findOne CORREGIDO ---
  async findOne(id: number): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const { password, ...result } = user;
    return result;
  }

  // --- MÉTODO update CORREGIDO ---
  async update(id: number, updateUserDto: UpdateUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.preload({
      id: id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, this.saltRounds);
    }
    const updatedUser = await this.userRepository.save(user);
    const { password, ...result } = updatedUser;
    return result;
  }

  // --- MÉTODO remove (ya estaba bien) ---
  async remove(id: number): Promise<void> {
    if (id === 1) {
      throw new ForbiddenException('No se puede eliminar al administrador principal.');
    }
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
  }

  // --- Métodos existentes ---
  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, this.saltRounds);
    user.password = hashedPassword;
    await this.userRepository.save(user);
  }
}
