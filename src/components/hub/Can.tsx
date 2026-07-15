import React from 'react';
import { usePermissions, type PermissionKey } from '../../contexts/PermissionsContext';

interface CanProps {
  /** Single permission key */
  permission?: PermissionKey;
  /** Any of these permissions grants access */
  anyOf?: PermissionKey[];
  /** All of these permissions required */
  allOf?: PermissionKey[];
  /** Rendered when access is denied (optional) */
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Conditionally renders children based on the current user's permissions.
 * Super Admin bypasses all checks.
 *
 * <Can permission="materials.create"><Button>New</Button></Can>
 */
export const Can: React.FC<CanProps> = ({ permission, anyOf, allOf, fallback = null, children }) => {
  const { has, hasAny, hasAll } = usePermissions();
  let allowed = true;
  if (permission) allowed = allowed && has(permission);
  if (anyOf && anyOf.length > 0) allowed = allowed && hasAny(...anyOf);
  if (allOf && allOf.length > 0) allowed = allowed && hasAll(...allOf);
  return <>{allowed ? children : fallback}</>;
};
