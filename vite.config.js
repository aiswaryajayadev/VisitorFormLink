// vite.config.js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    hmr: {
      host: '172.16.4.89',  // IP address you want WebSocket to use
      port: 9000            // Port for WebSocket
    },
    host: '0.0.0.0',        // Allows access from other devices on the network
    port: 9000              // Server port
  }
});
