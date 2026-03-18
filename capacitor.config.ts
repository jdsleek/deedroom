import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.signnest.app',
  appName: 'SignNest',
  webDir: 'out',
  server: {
    url: process.env.CAPACITOR_SERVER_URL,
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#FAFAF8',
  },
};

export default config;
