import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
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
    private dataSource: DataSource,
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

  async deleteUser(id: number, currentAdminId: number) {
    if (id === currentAdminId) {
      throw new BadRequestException('You cannot delete your own account');
    }
    const user = await this.userRepo.findOne({ where: { id }, relations: ['client'] });
    if (!user) throw new NotFoundException('User not found');

    await this.dataSource.transaction(async (manager) => {
      if (user.client) {
        await manager.createQueryBuilder().delete().from(Request)
          .where('clientId = :clientId', { clientId: user.client.id }).execute();
        await manager.createQueryBuilder().delete().from(Program)
          .where('clientId = :clientId', { clientId: user.client.id }).execute();
        await manager.delete(Client, { id: user.client.id });
      }
      await manager.createQueryBuilder().delete().from(Request)
        .where('coachId = :coachId', { coachId: user.id }).execute();
      await manager.createQueryBuilder().delete().from(Program)
        .where('coachId = :coachId', { coachId: user.id }).execute();
      await manager.delete(User, { id: user.id });
    });

    return { message: 'User deleted' };
  }
}
