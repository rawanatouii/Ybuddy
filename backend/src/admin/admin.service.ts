import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/user.entity';
import { Client } from '../clients/client.entity';
import { Program } from '../programs/program.entity';
import { Request } from '../requests/request.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Program) private programRepo: Repository<Program>,
    @InjectRepository(Request) private requestRepo: Repository<Request>,
  ) {}

  async getStats() {
    const [totalUsers, totalCoaches, totalClients, totalPrograms, totalRequests] = await Promise.all([
      this.userRepo.count(),
      this.userRepo.count({ where: { role: UserRole.COACH } }),
      this.userRepo.count({ where: { role: UserRole.CLIENT } }),
      this.programRepo.count(),
      this.requestRepo.count(),
    ]);
    return { totalUsers, totalCoaches, totalClients, totalPrograms, totalRequests };
  }

  getAllUsers() {
    return this.userRepo.find({ select: ['id', 'email', 'role', 'name', 'slug', 'createdAt'] });
  }
}
