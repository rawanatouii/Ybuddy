import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from './user.entity';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private config: ConfigService,
  ) {}

  async onModuleInit() {
    const adminEmail = this.config.get('ADMIN_EMAIL');
    const adminPassword = this.config.get('ADMIN_PASSWORD');
    const exists = await this.userRepo.findOne({ where: { email: adminEmail } });
    if (!exists) {
      const hash = await bcrypt.hash(adminPassword, 10);
      await this.userRepo.save(
        this.userRepo.create({
          email: adminEmail,
          password: hash,
          role: UserRole.ADMIN,
          name: 'Super Admin',
          slug: 'superadmin',
          publicProfileName: 'Super Admin',
          isVerified: true,
        }),
      );
      console.log('Admin seeded:', adminEmail);
    }
  }

  findById(id: number) {
    return this.userRepo.findOne({ where: { id } });
  }

  findByEmail(email: string) {
    return this.userRepo.findOne({ where: { email } });
  }

  findBySlug(slug: string) {
    return this.userRepo.findOne({ where: { slug, role: UserRole.COACH } });
  }

  findAllCoaches() {
    return this.userRepo.find({ where: { role: UserRole.COACH } });
  }

  findAll() {
    return this.userRepo.find({ select: ['id', 'email', 'role', 'name', 'slug', 'createdAt'] });
  }
}
