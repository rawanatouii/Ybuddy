import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserRole } from '../users/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(dto.password, 10);
    const slug = dto.slug || `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const publicProfileName = dto.publicProfileName || dto.name || dto.email.split('@')[0];
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = this.userRepo.create({
      email: dto.email,
      password: hash,
      role: dto.role,
      name: dto.name,
      slug,
      publicProfileName,
      isVerified: false,
      verificationToken,
    });
    await this.userRepo.save(user);

    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return { message: 'Account created. Please check your email to verify your account.' };
  }

  async verifyEmail(token: string) {
    const user = await this.userRepo.findOne({ where: { verificationToken: token } });
    if (!user) throw new BadRequestException('Invalid or expired verification token');

    user.isVerified = true;
    user.verificationToken = null;
    await this.userRepo.save(user);

    return this.signToken(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');
    if (!user.isVerified) throw new UnauthorizedException('Please verify your email before logging in');
    return this.signToken(user);
  }

  private signToken(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role, name: user.name, slug: user.slug },
    };
  }
}
