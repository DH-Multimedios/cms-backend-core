import { jest as jestRuntime } from '@jest/globals';
import { ExecutionContext } from '@nestjs/common';
import { ApiException } from '../../../common/exceptions/api.exception';
import { ErrorCode } from '../../../common/enums/error-codes.enum';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { User } from '../../../database/entities/user.entity';
import { Role } from '../../../database/entities/role.entity';
import { Permission } from '../../../database/entities/permission.entity';

const jest = jestRuntime as typeof globalThis.jest;

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    isSystemUser: false,
    roles: [],
    ...overrides,
  }) as User;

const makeContext = (user: User, permissions: string[] = []): ExecutionContext => {
  const reflector = { getAllAndOverride: jest.fn().mockReturnValue(permissions) };
  const context = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  } as unknown as ExecutionContext;
  return context;
};

describe('PermissionsGuard', () => {
  let guard: PermissionsGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn() } as any;
    guard = new PermissionsGuard(reflector);
  });

  it('permite si no hay @RequirePermissions', () => {
    reflector.getAllAndOverride.mockReturnValue(null);
    const ctx = makeContext(makeUser());

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite si @RequirePermissions está vacío', () => {
    reflector.getAllAndOverride.mockReturnValue([]);
    const ctx = makeContext(makeUser());

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite si el usuario es isSystemUser independientemente de permisos', () => {
    reflector.getAllAndOverride.mockReturnValue(['users.delete', 'roles.delete']);
    const ctx = makeContext(makeUser({ isSystemUser: true }));

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('permite si el usuario tiene todos los permisos requeridos', () => {
    const permission = { name: 'users.read' } as Permission;
    const role = { permissions: [permission] } as Role;
    const user = makeUser({ roles: [role] });
    reflector.getAllAndOverride.mockReturnValue(['users.read']);

    const ctx = makeContext(user);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('lanza ApiException FORBIDDEN si falta algún permiso', () => {
    const permission = { name: 'users.read' } as Permission;
    const role = { permissions: [permission] } as Role;
    const user = makeUser({ roles: [role] });
    reflector.getAllAndOverride.mockReturnValue(['users.read', 'users.delete']);

    const ctx = makeContext(user);

    expect(() => guard.canActivate(ctx)).toThrow(ApiException);
  });

  it('lanza ApiException FORBIDDEN si el usuario no tiene ningún permiso', () => {
    reflector.getAllAndOverride.mockReturnValue(['users.read']);
    const ctx = makeContext(makeUser({ roles: [] }));

    expect(() => guard.canActivate(ctx)).toThrow(ApiException);
  });
});
