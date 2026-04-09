import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { AuthService } from './auth.service';
import { RefreshToken } from '../../database/entities/refresh-token.entity';
import { User } from '../../database/entities/user.entity';
import { UsersService } from '../users/users.service';

const mockRefreshTokenRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn((dto) => dto),
  update: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mock-access-token'),
});

const mockUsersService = () => ({
  updateLastLogin: jest.fn(),
  findByEmail: jest.fn(),
});

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    email: 'user@test.com',
    isActive: true,
    isSystemUser: false,
    roles: [],
    ...overrides,
  }) as User;

const makeStoredToken = (overrides = {}) => ({
  id: 'token-1',
  token: 'hashed-token',
  userId: 'user-1',
  user: makeUser(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  revokedAt: null,
  ...overrides,
});

describe('AuthService', () => {
  let service: AuthService;
  let refreshTokenRepo: ReturnType<typeof mockRefreshTokenRepository>;
  let jwtService: ReturnType<typeof mockJwtService>;
  let usersService: ReturnType<typeof mockUsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'CORE_AUTH_CONFIG', useValue: { jwtSecret: 'test-secret', jwtExpiration: '15m', jwtRefreshExpiration: '7' } },
        { provide: getRepositoryToken(RefreshToken), useFactory: mockRefreshTokenRepository },
        { provide: JwtService, useFactory: mockJwtService },
        { provide: UsersService, useFactory: mockUsersService },
      ],
    }).compile();

    service = module.get(AuthService);
    refreshTokenRepo = module.get(getRepositoryToken(RefreshToken));
    jwtService = module.get(JwtService);
    usersService = module.get(UsersService);
  });

  describe('login', () => {
    it('actualiza lastLogin y devuelve tokens + usuario', async () => {
      const user = makeUser();
      refreshTokenRepo.save.mockResolvedValue({});

      const result = await service.login(user, '127.0.0.1', 'Mozilla');

      expect(usersService.updateLastLogin).toHaveBeenCalledWith(user.id);
      expect(jwtService.sign).toHaveBeenCalled();
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe(user.id);
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('refresh', () => {
    it('rota el refresh token y devuelve nuevos tokens', async () => {
      const storedToken = makeStoredToken();
      refreshTokenRepo.findOne.mockResolvedValue(storedToken);
      refreshTokenRepo.save.mockResolvedValue({ ...storedToken, revokedAt: new Date() });

      const result = await service.refresh('raw-token');

      // Token viejo revocado
      expect(refreshTokenRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
      // Nuevos tokens generados
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBeDefined();
    });

    it('lanza ApiException INVALID_REFRESH_TOKEN si el token no existe', async () => {
      refreshTokenRepo.findOne.mockResolvedValue(null);
      await expect(service.refresh('invalid-token')).rejects.toMatchObject({
        code: ErrorCode.INVALID_REFRESH_TOKEN,
      });
    });

    it('lanza ApiException INVALID_REFRESH_TOKEN si el usuario está inactivo', async () => {
      refreshTokenRepo.findOne.mockResolvedValue(
        makeStoredToken({ user: makeUser({ isActive: false }) }),
      );
      await expect(service.refresh('raw-token')).rejects.toThrow(ApiException);
    });
  });

  describe('logout', () => {
    it('revoca el refresh token', async () => {
      refreshTokenRepo.update.mockResolvedValue({ affected: 1 });

      await service.logout('raw-token');

      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ revokedAt: expect.anything() }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });

  describe('logoutAll', () => {
    it('revoca todos los tokens del usuario', async () => {
      refreshTokenRepo.update.mockResolvedValue({ affected: 3 });

      await service.logoutAll('user-1');

      expect(refreshTokenRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });
});
