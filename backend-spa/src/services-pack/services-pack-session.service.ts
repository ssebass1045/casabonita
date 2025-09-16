import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicesPackSession } from './entities/services-pack-session.entity';
import { CreateSessionDto } from './dto/create-session.dto';

@Injectable()
export class ServicesPackSessionService {
  constructor(
    @InjectRepository(ServicesPackSession)
    private readonly sessionRepository: Repository<ServicesPackSession>,
  ) {}

  async createSession(createSessionDto: CreateSessionDto): Promise<ServicesPackSession> {
    const session = this.sessionRepository.create(createSessionDto);
    return await this.sessionRepository.save(session);
  }

  async getSessionsByEmployee(employeeId: number): Promise<ServicesPackSession[]> {
    return await this.sessionRepository.find({
      where: { employeeId },
      relations: ['clientServicesPack', 'clientServicesPack.client', 'employee'],
    });
  }

  async getSessionsByClientPack(clientServicesPackId: number): Promise<ServicesPackSession[]> {
    return await this.sessionRepository.find({
      where: { clientServicesPackId },
      relations: ['employee'],
    });
  }
}