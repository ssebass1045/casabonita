
import { Injectable, NotFoundException, OnModuleInit, BadRequestException } from '@nestjs/common'; // Agrega OnModuleInit, BadRequestException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdatePasswordDto } from './dto/update-password.dto'; 
import * as bcrypt from 'bcrypt'; // Importa bcrypt

@Injectable()
export class UserService implements OnModuleInit {
  private readonly saltRounds = 10; // Factor de coste para bcrypt (10-12 es común)

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  // Se ejecuta una vez que el módulo ha sido inicializado
  async onModuleInit() {
    await this.seedAdminUser();
  }

  // Método para sembrar el usuario admin inicial
  private async seedAdminUser() {
    const adminUsername = process.env.ADMIN_USERNAME ?? 'admin';
    const adminExists = await this.userRepository.findOne({ where: { username: adminUsername } });

    if (!adminExists) {
      console.log(`Creando usuario administrador inicial: ${adminUsername}`);
      const adminPassword = process.env.ADMIN_PASSWORD ?? 'password123'; // <-- ¡Cambia esto en .env!

      if (!adminPassword) {
          throw new Error('ADMIN_PASSWORD no está definida en las variables de entorno.');
      }

      // Hashea la contraseña antes de crear el usuario
      const hashedPassword = await bcrypt.hash(adminPassword, this.saltRounds);

      const adminUser = this.userRepository.create({
        username: adminUsername,
        password: hashedPassword, // Guarda la contraseña hasheada
      });
      await this.userRepository.save(adminUser);
      console.log('Usuario administrador creado.');
    }
  }

  // Método para encontrar un usuario por su username (usado por AuthService)
  async findOneByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { username } });
  }

  // Método para encontrar un usuario por su ID (usado para cambio de contraseña)
  async findOneById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }
    return user;
  }

  // Método para actualizar la contraseña usando bcrypt
  async updatePassword(id: number, updatePasswordDto: UpdatePasswordDto): Promise<void> {
    const user = await this.findOneById(id);

    // Hashea la nueva contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(updatePasswordDto.newPassword, this.saltRounds);
    user.password = hashedPassword;

    await this.userRepository.save(user);
  }

}
