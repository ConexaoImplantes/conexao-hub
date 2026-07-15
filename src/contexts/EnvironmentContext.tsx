import React from "react";
import type { EnvironmentId } from "../lib/environments";

export interface EnvContextValue {
  active: EnvironmentId | null;
  eligible: EnvironmentId[];
  switchEnvironment: () => void;
  setActive: (env: EnvironmentId) => void;
}

export const EnvContext = React.createContext<EnvContextValue | undefined>(undefined);

export const useEnvironment = () => {
  const ctx = React.useContext(EnvContext);
  if (!ctx) throw new Error("useEnvironment must be used within AppContent");
  return ctx;
};
