import { useMemo } from "react";

export function useBooleanFlag(_key: string, defaultValue: boolean = true) {
  return defaultValue;
}

export function useModuleFlag(_key: string, defaultValue: boolean = true) {
  return defaultValue;
}

export function useSpaceFlag(
  _key: string,
  _makerspaceId?: string,
  defaultValue: boolean = true,
) {
  return defaultValue;
}

export function useIsInternalUser() {
  return false;
}

export function useConfigFlag<T = any>(_key: string, defaultValue: T): T {
  return useMemo(() => defaultValue, [defaultValue]);
}
