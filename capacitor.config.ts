import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.snapstamps.collector',
  appName: 'SnapStamps',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: true,
      style: 'LIGHT',
      backgroundColor: '#F7F7F9',
    },
  },
};

export default config;
