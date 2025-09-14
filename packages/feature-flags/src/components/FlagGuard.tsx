import React from "react";

export interface FlagGuardProps {
  flagKey: string;
  children: React.ReactNode;
  showComingSoon?: boolean;
  moduleName?: string;
  className?: string;
}

export const FlagGuard: React.FC<FlagGuardProps> = ({ children }) => (
  <>{children}</>
);
export const ModuleGuard: React.FC<FlagGuardProps> = ({
  children,
  className,
}) => <div className={className}>{children}</div>;
export const NavLinkGuard: React.FC<FlagGuardProps> = ({ children }) => (
  <>{children}</>
);
export const KillSwitchGuard: React.FC<FlagGuardProps> = ({ children }) => (
  <>{children}</>
);
export const ButtonGuard: React.FC<FlagGuardProps> = ({ children }) => (
  <>{children}</>
);
export const AdminGuard: React.FC<FlagGuardProps> = ({ children }) => (
  <>{children}</>
);

export default FlagGuard;
