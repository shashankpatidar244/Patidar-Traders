import { ROLE_PERMISSIONS, Permission } from "./permissions"

export function hasPermission(
  role: string,
  permission: Permission
) {
  const rolePerms = ROLE_PERMISSIONS[role] || []

  // ✅ HANDLE SUPER ADMIN
  if (rolePerms.includes("ALL")) return true

  return rolePerms.includes(permission)
}