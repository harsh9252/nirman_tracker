// Frontend Configuration
const config = {
  // API Configuration - Simple environment variable based
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    timeout: 10000
  },

  // Socket Configuration
  socket: {
    url: import.meta.env.VITE_SOCKET_URL
  },

  // App Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'DDC Developer',
    version: '1.0.0',
    environment: import.meta.env.MODE || 'development',
    port: import.meta.env.VITE_FRONTEND_PORT || '5173'
  }
};

export default config;
