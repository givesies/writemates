'use client'

import { useSyncExternalStore } from 'react'

// True when the site is running inside the Writemates iOS app (Capacitor),
// false in a normal browser and while rendering on the server.
function isNativeApp(): boolean {
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor
  return !!cap?.isNativePlatform?.()
}

export function useIsNativeApp(): boolean {
  return useSyncExternalStore(() => () => {}, isNativeApp, () => false)
}
