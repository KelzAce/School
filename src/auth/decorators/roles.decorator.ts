import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity.js';

export const ROLES_KEY = 'roles';

/**
 * Restricts access to users with the specified roles.
 * Usage: @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
