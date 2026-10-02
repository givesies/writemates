import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.writemates.app',
  appName: 'Writemates',
  webDir: 'public',
  server: {
    url: 'https://writemates.vercel.app',
    cleartext: false
  }
};

export default config;
