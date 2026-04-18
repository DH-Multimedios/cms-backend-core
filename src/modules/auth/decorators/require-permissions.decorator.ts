import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const PERMISSIONS_ANY_KEY = 'permissions_any';

/**
 * Requiere que el usuario tenga TODOS los permisos especificados (AND)
 * @example @RequirePermissions('users.read', 'users.create')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

/**
 * Requiere que el usuario tenga AL MENOS UNO de los permisos especificados (OR)
 * @example @RequireAnyPermission('roles.read', 'users.read')
 */
export const RequireAnyPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_ANY_KEY, permissions);
