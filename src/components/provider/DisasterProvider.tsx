import React from "react";

import {
  type DisasterStoreState,
  useDisasterStore,
} from "#/store/useDisasterStore";

export function useDisaster(): DisasterStoreState {
  return useDisasterStore();
}

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <React.Fragment>{children}</React.Fragment>;
};

export { useDisasterStore };
