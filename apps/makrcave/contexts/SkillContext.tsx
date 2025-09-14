'use client';

import { createContext, useContext, ReactNode } from 'react';

interface UserSkill {
  skillId: string;
  status: 'certified' | 'in_progress' | 'expired' | 'revoked';
}

interface AccessCheckResult {
  canAccess: boolean;
  missingSkills: string[];
  reason?: string;
}

interface SkillContextValue {
  userSkills: UserSkill[];
  hasSkill: (skillId: string) => boolean;
  getRequiredSkillsForEquipment: (equipmentId: string) => string[];
  canAccessEquipment: (equipmentId?: string) => AccessCheckResult;
  hasSkillForEquipment: (equipmentId?: string) => boolean;
}

const SkillContext = createContext<SkillContextValue | null>(null);

export function SkillProvider({ children }: { children: ReactNode }) {
  const value: SkillContextValue = {
    userSkills: [],
    hasSkill: () => true,
    getRequiredSkillsForEquipment: () => [],
    canAccessEquipment: () => ({ canAccess: true, missingSkills: [] }),
    hasSkillForEquipment: () => true,
  };
  return <SkillContext.Provider value={value}>{children}</SkillContext.Provider>;
}

export function useSkills() {
  const ctx = useContext(SkillContext);
  if (!ctx) throw new Error('useSkills must be used within SkillProvider');
  return ctx;
}
