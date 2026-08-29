import {
  type DisasterStoreState,
  useDisasterStore,
} from "#/store/useDisasterStore";

export function useDisaster(): DisasterStoreState {
  return useDisasterStore();
}

export { useDisasterStore };
