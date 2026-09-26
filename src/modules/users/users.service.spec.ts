import { jest as jestRuntime } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ApiException } from '../../common/exceptions/api.exception';
import { ErrorCode } from '../../common/enums/error-codes.enum';
import { UsersService } from './users.service';
import { User } from '../../database/entities/user.entity';
import { Role } from '../../database/entities/role.entity';
import { UsersQueryDto } from './dto/users-query.dto';
import { AuditService } from '../audit/audit.service';
import { MediaService } from '../media/media.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

const jest = jestRuntime as typeof globalThis.jest;

const mockQb = (users: User[] = [], total = 0) => ({
  leftJoinAndSelect: jest.fn().mockReturnThis(),
  where: jest.fn().mockReturnThis(),
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([users, total]),
});

const mockUserRepository = () => ({
  createQueryBuilder: jest.fn(() => mockQb()),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn((dto) => dto),
  remove: jest.fn(),
  softDelete: jest.fn(),
  update: jest.fn(),
});

const mockRoleRepository = () => ({
  findBy: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
});

const mockAuditService = () => ({
  log: jest.fn().mockResolvedValue(undefined),
});

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    email: 'user@test.com',
    password: 'hashed',
    firstName: 'John',
    lastName: 'Doe',
    isActive: true,
    isSystemUser: false,
    isProtected: false,
    roles: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
    ...overrides,
  }) as User;

const makeSystemUser = (): User =>
  makeUser({ id: 'system-1', isSystemUser: true, isProtected: true });

describe('UsersService', () => {
  let service: UsersService;
  let userRepo: ReturnType<typeof mockUserRepository>;
  let roleRepo: ReturnType<typeof mockRoleRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useFactory: mockUserRepository },
        { provide: getRepositoryToken(Role), useFactory: mockRoleRepository },
        { provide: AuditService, useFactory: mockAuditService },
        { provide: MediaService, useValue: {} },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get(UsersService);
    userRepo = module.get(getRepositoryToken(User));
    roleRepo = module.get(getRepositoryToken(Role));
  });

  describe('findAll', () => {
    it('devuelve resultado paginado excluyendo isSystemUser', async () => {
      const users = [makeUser()];
      const qb = mockQb(users, 1);
      userRepo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll(new UsersQueryDto(), makeSystemUser());

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.items[0]).not.toHaveProperty('password');
    });
  });

  describe('findOne', () => {
    it('devuelve el usuario si existe', async () => {
      userRepo.findOne.mockResolvedValue(makeUser());
      const result = await service.findOne('user-1', makeSystemUser());
      expect(result.id).toBe('user-1');
    });

    it('lanza ApiException USER_NOT_FOUND si no existe', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('non-existent', makeSystemUser())).rejects.toMatchObject({
        code: ErrorCode.USER_NOT_FOUND,
      });
    });
  });

  describe('create', () => {
    it('crea un usuario correctamente', async () => {
      userRepo.findOneBy.mockResolvedValue(null);
      roleRepo.findBy.mockResolvedValue([]);
      const savedUser = makeUser({ email: 'new@test.com' });
      userRepo.save.mockResolvedValue(savedUser);

      const result = await service.create({
        email: 'new@test.com',
        password: 'password123',
      });

      expect(result.email).toBe('new@test.com');
    });

    it('lanza ApiException USER_EMAIL_TAKEN si el email ya existe', async () => {
      userRepo.findOneBy.mockResolvedValue(makeUser());

      await expect(
        service.create({ email: 'user@test.com', password: 'password123' }),
      ).rejects.toMatchObject({ code: ErrorCode.USER_EMAIL_TAKEN });
    });
  });

  describe('update', () => {
    it('actualiza un usuario correctamente', async () => {
      const user = makeUser();
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({ ...user, firstName: 'Jane' });
      const currentUser = makeUser({ id: 'admin-1' });

      const result = await service.update('user-1', { firstName: 'Jane' }, currentUser);

      expect(result.firstName).toBe('Jane');
    });

    it('lanza ApiException USER_PROTECTED al modificar usuario protegido sin ser systemUser', async () => {
      userRepo.findOne.mockResolvedValue(makeUser({ isProtected: true }));
      const currentUser = makeUser({ id: 'admin-1' });

      await expect(
        service.update('user-1', { firstName: 'Jane' }, currentUser),
      ).rejects.toMatchObject({
        code: ErrorCode.USER_PROTECTED,
      });
    });

    it('permite modificar usuario protegido si sos systemUser', async () => {
      const user = makeUser({ isProtected: true });
      userRepo.findOne.mockResolvedValue(user);
      userRepo.save.mockResolvedValue({ ...user, firstName: 'Jane' });
      const systemUser = makeSystemUser();

      const result = await service.update('user-1', { firstName: 'Jane' }, systemUser);

      expect(result.firstName).toBe('Jane');
    });

    it('no permite asignar un rol de mayor peso al propio', async () => {
      const user = makeUser();
      userRepo.findOne.mockResolvedValue(user);
      const currentUser = makeUser({
        roles: [
          {
            weight: 50,
            permissions: [{ name: 'roles.update' }],
          } as Role,
        ],
      });
      roleRepo.findBy.mockResolvedValue([{ weight: 90 } as Role]);

      await expect(
        service.update('user-1', { roleIds: ['role-admin'] }, currentUser),
      ).rejects.toMatchObject({ code: ErrorCode.ROLE_WEIGHT_EXCEEDED });
    });
  });

  describe('remove', () => {
    it('elimina un usuario correctamente', async () => {
      userRepo.findOne.mockResolvedValue(makeUser());
      userRepo.remove.mockResolvedValue(undefined);
      const currentUser = makeUser({ id: 'admin-1' });

      await expect(service.remove('user-1', currentUser)).resolves.not.toThrow();
    });

    it('lanza ApiException USER_PROTECTED al eliminar usuario protegido sin ser systemUser', async () => {
      userRepo.findOne.mockResolvedValue(makeUser({ isProtected: true }));
      const currentUser = makeUser({ id: 'admin-1' });

      await expect(service.remove('user-1', currentUser)).rejects.toMatchObject({
        code: ErrorCode.USER_PROTECTED,
      });
    });

    it('permite eliminar usuario protegido si sos systemUser', async () => {
      userRepo.findOne.mockResolvedValue(makeUser({ isProtected: true }));
      userRepo.remove.mockResolvedValue(undefined);
      const systemUser = makeSystemUser();

      await expect(service.remove('user-1', systemUser)).resolves.not.toThrow();
    });
  });
});
