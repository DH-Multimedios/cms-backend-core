import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { AuthService } from './auth.service';
import { Session } from '../../database/entities/session.entity';
import { User } from '../../database/entities/user.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { UsersService } from '../users/users.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SettingsService } from '../settings/settings.service';

const mockSessionRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn((dto) => dto),
  update: jest.fn(),
});

const mockUsersService = () => ({
  updateLastLogin: jest.fn(),
  findByEmail: jest.fn(),
  updatePassword: jest.fn(),
});

const mockAuditService = () => ({
  log: jest.fn().mockResolvedValue(undefined),
});

const mockPasswordResetTokenRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn((dto) => dto),
  update: jest.fn(),
});

const mockNotificationsService = () => ({
  notifySystem: jest.fn().mockResolvedValue(undefined),
  sendEmail: jest.fn().mockResolvedValue(undefined),
});

const mockSettingsService = () => ({
  getValue: jest.fn().mockResolvedValue('365'),
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

describe('AuthService', () => {
  let service: AuthService;
  let sessionRepo: ReturnType<typeof mockSessionRepository>;
  let usersService: ReturnType<typeof mockUsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'CORE_AUTH_CONFIG',
          useValue: { sessionExpiration: '365' },
        },
        { provide: getRepositoryToken(Session), useFactory: mockSessionRepository },
        {
          provide: getRepositoryToken(PasswordResetToken),
          useFactory: mockPasswordResetTokenRepository,
        },
        { provide: UsersService, useFactory: mockUsersService },
        { provide: AuditService, useFactory: mockAuditService },
        { provide: NotificationsService, useFactory: mockNotificationsService },
        { provide: SettingsService, useFactory: mockSettingsService },
      ],
    }).compile();

    service = module.get(AuthService);
    sessionRepo = module.get(getRepositoryToken(Session));
    usersService = module.get(UsersService);
  });

  describe('login', () => {
    it('actualiza lastLogin, crea sesión y devuelve sessionId + usuario', async () => {
      const user = makeUser();
      sessionRepo.save.mockResolvedValue({});

      const result = await service.login(user, '127.0.0.1', 'Mozilla');

      expect(usersService.updateLastLogin).toHaveBeenCalledWith(user.id);
      expect(sessionRepo.save).toHaveBeenCalled();
      expect(result.sessionId).toBeDefined();
      expect(typeof result.sessionId).toBe('string');
      expect(result.user.id).toBe(user.id);
      expect(result.user).not.toHaveProperty('password');
    });
  });

  describe('logout', () => {
    it('revoca la sesión del usuario', async () => {
      sessionRepo.update.mockResolvedValue({ affected: 1 });

      await service.logout('raw-session-id', 'user-1');

      expect(sessionRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ revokedAt: expect.anything() }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });

  describe('logoutAll', () => {
    it('revoca todas las sesiones del usuario', async () => {
      sessionRepo.update.mockResolvedValue({ affected: 3 });

      await service.logoutAll('user-1');

      expect(sessionRepo.update).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'user-1' }),
        expect.objectContaining({ revokedAt: expect.any(Date) }),
      );
    });
  });

  describe('forgotPassword', () => {
    it('genera código y envía notificación si el usuario existe', async () => {
      const user = makeUser();
      usersService.findByEmail.mockResolvedValue(user);

      const result = await service.forgotPassword('user@test.com');

      expect(result.message).toBeDefined();
      expect(usersService.findByEmail).toHaveBeenCalledWith('user@test.com');
    });

    it('responde igual si el usuario no existe (no revela existencia)', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('noexiste@test.com');

      expect(result.message).toBe('Si el email existe, recibirás un código en breve');
    });
  });

  describe('verifyResetCode', () => {
    it('lanza error si el código no existe o expiró', async () => {
      usersService.findByEmail.mockResolvedValue(makeUser());

      await expect(service.verifyResetCode('user@test.com', '123456')).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_ERROR,
      });
    });
  });

  describe('resetPassword', () => {
    it('lanza error si el resetToken no existe o expiró', async () => {
      await expect(service.resetPassword('invalid-token', 'newpass123')).rejects.toMatchObject({
        code: ErrorCode.VALIDATION_ERROR,
      });
    });
  });
});
