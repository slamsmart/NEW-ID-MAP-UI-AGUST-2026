import { createContext, useContext } from 'react';

export const ClerkReadyContext = createContext(false);

/** true saat ClerkProvider sudah ter-mount dan hook Clerk aman dipanggil. */
export function useClerkReady() {
  return useContext(ClerkReadyContext);
}
