import React from "react";

interface BaseGuardProps {
  flagKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface FlagGuardProps extends BaseGuardProps {
  showComingSoon?: boolean;
}

export const FlagGuard: React.FC<FlagGuardProps> = ({ children }) => {
  return <>{children}</>;
};

export interface ModuleGuardProps extends FlagGuardProps {
  moduleName?: string;
  className?: string;
}

export const ModuleGuard: React.FC<ModuleGuardProps> = ({
  children,
  className,
}) => {
  return <div className={className}>{children}</div>;
};

export interface NavLinkGuardProps extends FlagGuardProps {
  href?: string;
  className?: string;
}

export const NavLinkGuard: React.FC<NavLinkGuardProps> = ({
  children,
  href,
  className,
}) => {
  if (href) {
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  }
  return <span className={className}>{children}</span>;
};

export interface KillSwitchGuardProps extends FlagGuardProps {
  maintenanceMessage?: string;
}

export const KillSwitchGuard: React.FC<KillSwitchGuardProps> = ({
  children,
}) => {
  return <>{children}</>;
};

export interface ButtonGuardProps extends FlagGuardProps {
  className?: string;
  type?: "button" | "submit" | "reset";
}

export const ButtonGuard: React.FC<ButtonGuardProps> = ({
  children,
  className,
}) => {
  return <div className={className}>{children}</div>;
};

export const AdminGuard: React.FC<FlagGuardProps> = ({ children }) => {
  return <>{children}</>;
};

export default FlagGuard;
