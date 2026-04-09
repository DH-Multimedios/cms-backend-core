import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RolesService } from './roles.service';
import { Role } from '../../database/entities/role.entity';
import { Permission } from '../../database/entities/permission.entity';
import { User } from '../../database/entities/user.entity';
import { PermissionsService } from '../permissions/permissions.service';

const mockRoleRepository = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn((dto) => dto),
  remove: jest.fn(),
});

const mockPermissionsService = () => ({
  findByIds: jest.fn(),
});

const makeRole = (overrides: Partial<Role> = {}): Role =>
  ({
    id: 'role-1',
    name: 'Editor',
    description: '',
    weight: 10,
    isProtected: false,
    permissions: [],
    users: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Role;

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-1',
    isSystemUser: false,
    roles: [],
    ...overrides,
  }) as User;

describe('RolesService', () => {
  let service: RolesService;
  let roleRepo: ReturnType<typeof mockRoleRepository>;
  let permissionsService: ReturnType<typeof mockPermissionsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        { provide: getRepositoryToken(Role), useFactory: mockRoleRepository },
        { provide: PermissionsService, useFactory: mockPermissionsService },
      ],
    }).compile();

    service = module.get(RolesService);
    roleRepo = module.get(getRepositoryToken(Role));
    permissionsService = module.get(PermissionsService);
  });

  describe('findOne', () => {
    it('devuelve el rol si existe', async () => {
      roleRepo.findOneBy.mockResolvedValue(makeRole());
      const result = await service.findOne('role-1');
      expect(result.id).toBe('role-1');
    });

    it('lanza NotFoundException si no existe', async () => {
      roleRepo.findOneBy.mockResolvedValue(null);
      await expect(service.findOne('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('crea un rol correctamente', async () => {
      roleRepo.findOneBy.mockResolvedValue(null);
      roleRepo.save.mockResolvedValue(makeRole({ name: 'Manager' }));
      const currentUser = makeUser();

      const result = await service.create({ name: 'Manager' }, currentUser);
      expect(result.name).toBe('Manager');
    });

    it('lanza ConflictException si el nombre ya existe', async () => {
      roleRepo.findOneBy.mockResolvedValue(makeRole());
      await expect(service.create({ name: 'Editor' }, makeUser())).rejects.toThrow(
        ConflictException,
      );
    });

    it('lanza ForbiddenException al crear rol protegido sin ser systemUser', async () => {
      roleRepo.findOneBy.mockResolvedValue(null);
      await expect(
        service.create({ name: 'SuperAdmin', isProtected: true }, makeUser()),
      ).rejects.toThrow(ForbiddenException);
    });

    it('permite crear rol protegido si sos systemUser', async () => {
      roleRepo.findOneBy.mockResolvedValue(null);
      roleRepo.save.mockResolvedValue(makeRole({ name: 'SuperAdmin', isProtected: true }));
      const systemUser = makeUser({ isSystemUser: true });

      const result = await service.create({ name: 'SuperAdmin', isProtected: true }, systemUser);
      expect(result.name).toBe('SuperAdmin');
    });
  });

  describe('update', () => {
    it('actualiza un rol no protegido correctamente', async () => {
      roleRepo.findOneBy.mockResolvedValue(makeRole());
      roleRepo.save.mockResolvedValue(makeRole({ description: 'Nueva descripción' }));
      roleRepo.findOneBy.mockResolvedValueOnce(makeRole()).mockResolvedValueOnce(null);

      const result = await service.update('role-1', { description: 'Nueva descripción' }, makeUser());
      expect(result.description).toBe('Nueva descripción');
    });

    it('lanza ForbiddenException al modificar rol protegido sin ser systemUser', async () => {
      roleRepo.findOneBy.mockResolvedValue(makeRole({ isProtected: true }));

      await expect(
        service.update('role-1', { description: 'algo' }, makeUser()),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('elimina un rol no protegido', async () => {
      roleRepo.findOneBy.mockResolvedValue(makeRole());
      roleRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove('role-1', makeUser())).resolves.not.toThrow();
    });

    it('lanza ForbiddenException al eliminar rol protegido sin ser systemUser', async () => {
      roleRepo.findOneBy.mockResolvedValue(makeRole({ isProtected: true }));

      await expect(service.remove('role-1', makeUser())).rejects.toThrow(ForbiddenException);
    });

    it('permite eliminar rol protegido si sos systemUser', async () => {
      roleRepo.findOneBy.mockResolvedValue(makeRole({ isProtected: true }));
      roleRepo.remove.mockResolvedValue(undefined);

      await expect(service.remove('role-1', makeUser({ isSystemUser: true }))).resolves.not.toThrow();
    });
  });

  describe('assignPermissions', () => {
    it('asigna permisos a un rol no protegido', async () => {
      const permissions = [{ id: 'perm-1' } as Permission];
      roleRepo.findOneBy.mockResolvedValue(makeRole());
      permissionsService.findByIds.mockResolvedValue(permissions);
      roleRepo.save.mockResolvedValue(makeRole({ permissions }));

      const result = await service.assignPermissions('role-1', ['perm-1'], makeUser());
      expect(result.permissions).toHaveLength(1);
    });

    it('lanza ForbiddenException al asignar permisos a rol protegido sin ser systemUser', async () => {
      roleRepo.findOneBy.mockResolvedValue(makeRole({ isProtected: true }));

      await expect(
        service.assignPermissions('role-1', ['perm-1'], makeUser()),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
