import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '../users/user.entity';

// ── Mock AuthService ───────────────────────────────────────────────────────────
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

const fakeToken = {
  access_token: 'mock.jwt.token',
  user: { id: 1, email: 'test@ybuddy.com', role: UserRole.CLIENT, name: 'Test', slug: 'test' },
};

// ── Suite ──────────────────────────────────────────────────────────────────────
describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  // ── POST /auth/register ───────────────────────────────────────────────────

  describe('register', () => {
    it('appelle AuthService.register et retourne le token', async () => {
      mockAuthService.register.mockResolvedValue(fakeToken);

      const dto = {
        email: 'nouveau@ybuddy.com',
        password: 'motdepasse123',
        role: UserRole.CLIENT,
        name: 'Agathe',
      };

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(fakeToken);
    });
  });

  // ── POST /auth/login ──────────────────────────────────────────────────────

  describe('login', () => {
    it('appelle AuthService.login et retourne le token', async () => {
      mockAuthService.login.mockResolvedValue(fakeToken);

      const dto = { email: 'test@ybuddy.com', password: 'motdepasse123' };
      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(fakeToken);
    });
  });

  // ── GET /auth/me ──────────────────────────────────────────────────────────

  describe('me', () => {
    it('retourne l\'utilisateur connecté sans son mot de passe', () => {
      const req = {
        user: {
          id: 1,
          email: 'test@ybuddy.com',
          role: UserRole.COACH,
          password: 'hash_secret',
          name: 'Jeanne',
        },
      };

      const result = controller.me(req as any);

      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('email', 'test@ybuddy.com');
      expect(result).toHaveProperty('role', UserRole.COACH);
    });
  });
});
