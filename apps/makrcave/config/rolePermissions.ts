export type Role = 'super_admin' | 'admin' | 'makerspace_admin' | 'service_provider' | 'user' | string;

interface Context {
  isOwnResource?: boolean;
  isAssignedMakerspace?: boolean;
}

export function hasPermission(role: Role, _domain: string, _action: string, ctx: Context = {}): boolean {
  // Simple, permissive defaults to unblock builds. Refine as needed.
  if (role === 'super_admin' || role === 'admin' || role === 'makerspace_admin') return true;

  // Basic user/service_provider rules
  if (role === 'user' || role === 'service_provider') {
    if (_domain === 'projects') {
      if (_action === 'view') return true;
      if (_action === 'create') return true;
      if (_action === 'edit' || _action === 'delete' || _action === 'addMembers') {
        return !!ctx.isOwnResource;
      }
      return false;
    }
    if (_domain === 'bom') {
      return !!ctx.isOwnResource;
    }
    if (_domain === 'equipment' && _action === 'reserve') return true;
  }

  // Fallback deny
  return false;
}

