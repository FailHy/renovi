// lib/utils/role.ts
export type UserRole = 'admin' | 'mandor' | 'pelanggan';

export const canEdit = (role: UserRole): boolean => {
  return role === 'mandor' || role === 'admin';
};

export const canDelete = (role: UserRole): boolean => {
  return role === 'mandor' || role === 'admin';
};

export const canCreate = (role: UserRole): boolean => {
  return role === 'mandor' || role === 'admin';
};

export const canView = (role: UserRole): boolean => true; // All roles can view

export const canAddTestimoni = (role: UserRole, progress: number): boolean => {
  return role === 'pelanggan' && progress === 100;
};

export const getUserPermissions = (role: UserRole) => ({
  canEdit: canEdit(role),
  canDelete: canDelete(role),
  canCreate: canCreate(role),
  canView: canView(role),
  canAddTestimoni: (progress: number) => canAddTestimoni(role, progress),
});