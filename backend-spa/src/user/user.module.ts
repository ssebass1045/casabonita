
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // Importa TypeOrmModule
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity'; // Importa la entidad User

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), 
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // Exporta UserService para que AuthModule pueda usarlo
})
export class UserModule {}
