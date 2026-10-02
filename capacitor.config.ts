import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.writemates.app',
  appName: 'Writemates',
  webDir: 'public',
  server: {
    url: 'https://www.writemates.app',
    cleartext: false
  }
};

export default config;
