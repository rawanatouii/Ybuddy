import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { UserRole } from '../users/user.entity';
import { ROLES_KEY } from './roles.decorator';

// ── Helpers ───────────────────────────────────────────────────────────────────
function buildContext(userRole: UserRole | null, requiredRoles: UserRole[] | undefined): ExecutionContext {
  return {
    getHandler: () => ({}),
    getClass: () => ({}),
    switchToHttp: () => ({
      getRequest: () => ({
        user: userRole !== null ? { role: userRole } : undefined,
      }),
    }),
  } as unknown as ExecutionContext;
}

// ── Suite ──────────────────────────────────────────────────────────────────────
describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  it('autorise l\'accès si aucun rôle n\'est requis (route publique)', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);
    const ctx = buildContext(null, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('autorise un ADMIN à accéder à une route réservée ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const ctx = buildContext(UserRole.ADMIN, [UserRole.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('autorise un COACH à accéder à une route réservée COACH', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.COACH]);
    const ctx = buildContext(UserRole.COACH, [UserRole.COACH]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('autorise un CLIENT à accéder à une route réservée CLIENT', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.CLIENT]);
    const ctx = buildContext(UserRole.CLIENT, [UserRole.CLIENT]);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('refuse un CLIENT qui tente d\'accéder à une route COACH', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.COACH]);
    const ctx = buildContext(UserRole.CLIENT, [UserRole.COACH]);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('refuse un CLIENT qui tente d\'accéder à une route ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const ctx = buildContext(UserRole.CLIENT, [UserRole.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('refuse un COACH qui tente d\'accéder à une route ADMIN', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.ADMIN]);
    const ctx = buildContext(UserRole.COACH, [UserRole.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(false);
  });

  it('autorise si la route accepte plusieurs rôles et que l\'utilisateur en possède un', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([UserRole.COACH, UserRole.ADMIN]);
    const ctx = buildContext(UserRole.COACH, [UserRole.COACH, UserRole.ADMIN]);
    expect(guard.canActivate(ctx)).toBe(true);
  });
});
