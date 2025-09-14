'use client';

import { createContext, useContext, ReactNode } from 'react';

export interface Member {
  id: string;
  name: string;
  email?: string;
  role?: string;
  status?: string;
  plan?: string;
  membership_plan_id?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  join_date?: string;
  projects_count?: number;
  reservations_count?: number;
  credits_used?: number;
  credits_remaining?: number;
  membership_plan_name?: string;
  start_date?: string;
  end_date?: string;
  keycloak_user_id?: string;
  skills?: { id: string; name: string }[];
}

export interface MembershipPlan {
  id: string;
  name: string;
  price?: number;
  features?: string[];
  description?: string;
  duration_days?: number;
}

interface Invite {
  id: string;
  email: string;
  membership_plan_id?: string;
  status?: 'pending' | 'accepted' | 'expired';
  role?: string;
  expires_at?: string;
}

interface MemberContextValue {
  members: Member[];
  memberStats: Record<string, number>;
  loading: boolean;
  error: string | null;
  membershipPlans: MembershipPlan[];
  invites: Invite[];
  removeMember: (id: string) => Promise<void> | void;
  suspendMember: (id: string) => Promise<void> | void;
  reactivateMember: (id: string) => Promise<void> | void;
  searchMembers: (q: string) => Member[];
  filterMembers: (f: Partial<Member>) => Member[];
  createMembershipPlan: (plan: Partial<MembershipPlan>) => Promise<void> | void;
  updateMember: (id: string, patch: Partial<Member>) => Promise<void> | void;
  addMember: (member: Partial<Member>) => Promise<void> | void;
  sendInvite: (email: string, planId?: string) => Promise<void> | void;
}

const Ctx = createContext<MemberContextValue | null>(null);

export function MemberProvider({ children }: { children: ReactNode }) {
  const value: MemberContextValue = {
    members: [],
    memberStats: {},
    loading: false,
    error: null,
    membershipPlans: [],
    invites: [],
    removeMember: async () => {},
    suspendMember: async () => {},
    reactivateMember: async () => {},
    searchMembers: () => [],
    filterMembers: () => [],
    createMembershipPlan: async () => {},
    updateMember: async () => {},
    addMember: async () => {},
    sendInvite: async () => {},
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useMembers() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useMembers must be used within MemberProvider');
  return ctx;
}

// Backward-compat alias for legacy imports
export const useMember = useMembers;
