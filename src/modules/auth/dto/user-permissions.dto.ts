export class RoleWithPermissionsDto {
  id: string;
  name: string;
  weight: number;
  permissions: { id: string; name: string; module: string }[];
}

export class UserPermissionsDto {
  /** Flat list de todos los permisos únicos del usuario */
  permissions: string[];
  /** Roles con sus permisos detallados */
  roles: RoleWithPermissionsDto[];
}
