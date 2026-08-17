import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { User, UserRole } from '../users/user.entity';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcryptjs';

// ── Mock repository ────────────────────────────────────────────────────────────
const mockUser: User = {
  id: 1,
  email: 'coach@ybuddy.com',
  password: '',          // filled per test
  role: UserRole.COACH,
  name: 'Jeanne Coach',
  slug: 'jeanne-coach',
  publicProfileName: 'Jeanne',
  isVerified: true,
  verificationToken: null,
  createdAt: new Date(),
  client: null,
  coachRequests: [],
  coachPrograms: [],
};

const mockRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

// ── Suite ──────────────────────────────────────────────────────────────────────
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: MailService, useValue: mockMailService },
      ],
    }).compile();


    
    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  // ── register ──────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      email: 'nouveau@ybuddy.com',
      password: 'motdepasse123',
      role: UserRole.CLIENT,
      name: 'Agathe Client',
    };

    it('crée un utilisateur et envoie un email de vérification', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockReturnValue({ ...mockUser, email: dto.email });
      mockRepo.save.mockResolvedValue({ ...mockUser, email: dto.email });

      const result = await service.register(dto);

      expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { email: dto.email } });
      expect(mockRepo.save).toHaveBeenCalledTimes(1);
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalledWith(dto.email, expect.any(String));
      expect(result).toHaveProperty('message');
    });

    it('génère un slug automatique si non fourni', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockImplementation((data) => ({ ...mockUser, ...data }));
      mockRepo.save.mockImplementation((user) => Promise.resolve(user));

      await service.register(dto);

      const createArg = mockRepo.create.mock.calls[0][0];
      expect(createArg.slug).toMatch(/^user-\d+-[a-z0-9]+$/);
    });

    it('utilise le slug fourni si présent', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockImplementation((data) => ({ ...mockUser, ...data }));
      mockRepo.save.mockImplementation((user) => Promise.resolve(user));

      await service.register({ ...dto, slug: 'mon-slug-perso' });

      const createArg = mockRepo.create.mock.calls[0][0];
      expect(createArg.slug).toBe('mon-slug-perso');
    });

    it('hache le mot de passe avec bcrypt avant de sauvegarder', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      mockRepo.create.mockImplementation((data) => ({ ...mockUser, ...data }));
      mockRepo.save.mockImplementation((user) => Promise.resolve(user));

      await service.register(dto);

      const createArg = mockRepo.create.mock.calls[0][0];
      const isHashed = await bcrypt.compare(dto.password, createArg.password);
      expect(isHashed).toBe(true);
    });

    it('lève ConflictException si l\'email est déjà utilisé', async () => {
      mockRepo.findOne.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.save).not.toHaveBeenCalled();
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    it('retourne un token JWT avec des identifiants valides', async () => {
      const hash = await bcrypt.hash('motdepasse123', 10);
      mockRepo.findOne.mockResolvedValue({ ...mockUser, password: hash });

      const result = await service.login({
        email: 'coach@ybuddy.com',
        password: 'motdepasse123',
      });

      expect(result).toHaveProperty('access_token', 'mock.jwt.token');
      expect(result.user.email).toBe('coach@ybuddy.com');
      expect(result.user.role).toBe(UserRole.COACH);
    });

    it('lève UnauthorizedException si l\'email n\'existe pas', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inconnu@ybuddy.com', password: 'motdepasse123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lève UnauthorizedException si le mot de passe est incorrect', async () => {
      const hash = await bcrypt.hash('bonmotdepasse', 10);
      mockRepo.findOne.mockResolvedValue({ ...mockUser, password: hash });

      await expect(
        service.login({ email: 'coach@ybuddy.com', password: 'mauvais' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('ne retourne jamais le mot de passe hashé dans la réponse', async () => {
      const hash = await bcrypt.hash('motdepasse123', 10);
      mockRepo.findOne.mockResolvedValue({ ...mockUser, password: hash });

      const result = await service.login({
        email: 'coach@ybuddy.com',
        password: 'motdepasse123',
      });

      expect(result.user).not.toHaveProperty('password');
    });
  });
});
