import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ServicesPackSessionService } from './services-pack-session.service';
import { CreateSessionDto } from './dto/create-session.dto';

@Controller('services-pack-sessions')
export class ServicesPackSessionController {
  constructor(private readonly sessionService: ServicesPackSessionService) {}

  @Post()
  async create(@Body() createSessionDto: CreateSessionDto) {
    return await this.sessionService.createSession(createSessionDto);
  }

  @Get('employee/:employeeId')
  async getByEmployee(@Param('employeeId') employeeId: number) {
    return await this.sessionService.getSessionsByEmployee(employeeId);
  }

  @Get('client-pack/:clientPackId')
  async getByClientPack(@Param('clientPackId') clientPackId: number) {
    return await this.sessionService.getSessionsByClientPack(clientPackId);
  }
}