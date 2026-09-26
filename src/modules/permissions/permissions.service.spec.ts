import { jest as jestRuntime } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PermissionsService } from './permissions.service';
import { Permission } from '../../database/entities/permission.entity';
import { PermissionsQueryDto } from './dto/permissions-query.dto';

const jest = jestRuntime as typeof globalThis.jest;

const mockQb = () => ({
  andWhere: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  take: jest.fn().mockReturnThis(),
  getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
});

const mockPermissionRepository = () => ({
  createQueryBuilder: jest.fn(() => mockQb()),
  findOneBy: jest.fn(),
  save: jest.fn(),
  create: jest.fn((dto) => dto),
});

describe('PermissionsService', () => {
  let service: PermissionsService;
  let repo: ReturnType<typeof mockPermissionRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        { provide: getRepositoryToken(Permission), useFactory: mockPermissionRepository },
      ],
    }).compile();

    service = module.get(PermissionsService);
    repo = module.get(getRepositoryToken(Permission));
  });

  describe('findAll', () => {
    it('retorna resultado paginado', async () => {
      const permissions = [{ id: '1', name: 'users.read', module: 'users' }] as Permission[];
      const qb = mockQb();
      qb.getManyAndCount.mockResolvedValue([permissions, 1]);
      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAll(new PermissionsQueryDto());

      expect(result.items).toEqual(permissions);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    it('aplica filtro de módulo', async () => {
      const qb = mockQb();
      qb.getManyAndCount.mockResolvedValue([[], 0]);
      repo.createQueryBuilder.mockReturnValue(qb);

      const query = Object.assign(new PermissionsQueryDto(), { module: 'users' });
      await service.findAll(query);

      expect(qb.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('module'),
        expect.objectContaining({ module: 'users' }),
      );
    });
  });

  describe('registerPermissions', () => {
    it('crea permisos que no existen', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await service.registerPermissions([
        { name: 'products.read', description: 'Ver productos', module: 'products' },
      ]);

      expect(repo.save).toHaveBeenCalledTimes(1);
    });

    it('ignora permisos que ya existen', async () => {
      repo.findOneBy.mockResolvedValue({ id: '1', name: 'products.read' });

      await service.registerPermissions([
        { name: 'products.read', description: 'Ver productos', module: 'products' },
      ]);

      expect(repo.save).not.toHaveBeenCalled();
    });

    it('maneja lista vacía sin errores', async () => {
      await service.registerPermissions([]);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });
});
