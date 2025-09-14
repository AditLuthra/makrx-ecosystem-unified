import { MakrXUser } from "./types";

export function hasRole(user: MakrXUser | null, role: string): boolean {
  if (!user) return false;
  return user.roles.includes(role);
}

export function hasAnyRole(user: MakrXUser | null, roles: string[]): boolean {
  if (!user) return false;
  return roles.some((role) => user.roles.includes(role));
}

export function isAdmin(user: MakrXUser | null): boolean {
  return hasRole(user, "admin");
}

export function isMakerspaceOwner(user: MakrXUser | null): boolean {
  return hasRole(user, "makerspace_owner");
}

export function isEventOrganizer(user: MakrXUser | null): boolean {
  return hasRole(user, "event_organizer");
}

export function isStoreManager(user: MakrXUser | null): boolean {
  return hasRole(user, "store_manager");
}

export function canManageOrganization(
  user: MakrXUser | null,
  organizationId: string,
): boolean {
  if (!user) return false;

  // Admin can manage any organization
  if (isAdmin(user)) return true;

  // Check if user has admin or owner role in the specific organization
  const userOrg = user.organizations.find((org) => org.id === organizationId);
  return userOrg ? ["owner", "admin"].includes(userOrg.role) : false;
}

export function getUserDisplayName(user: MakrXUser | null): string {
  if (!user) return "";

  if (user.firstName || user.lastName) {
    return `${user.firstName || ""} ${user.lastName || ""}`.trim();
  }

  return user.email.split("@")[0];
}

export function getInitials(user: MakrXUser | null): string {
  if (!user) return "";

  const displayName = getUserDisplayName(user);
  const parts = displayName.split(" ");

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return displayName.substring(0, 2).toUpperCase();
}

export function formatRole(role: string): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
}

export function getTokenExpiry(token: string): Date | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
}

export function createAuthHeaders(token?: string): Record<string, string> {
  const base: Record<string, string> = { "Content-Type": "application/json" };
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}
