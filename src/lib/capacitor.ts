'use client'

import { Capacitor } from '@capacitor/core'

export function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform()
  } catch {
    return false
  }
}

export function getPlatform(): 'ios' | 'android' | 'web' {
  try {
    return Capacitor.getPlatform() as 'ios' | 'android' | 'web'
  } catch {
    return 'web'
  }
}

export async function initCapacitorPlugins() {
  if (!isNativePlatform()) return

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#1B2838' })
  } catch {}

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide()
  } catch {}

  try {
    const { App: CapApp } = await import('@capacitor/app')
    CapApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      } else {
        CapApp.exitApp()
      }
    })
  } catch {}
}

export function getSafeAreaClasses() {
  if (!isNativePlatform()) return ''
  return 'pt-safe pb-safe'
}
