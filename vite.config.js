// import { defineConfig } from 'vite';
// import react from '@vitejs/plugin-react';

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
//   server: {
//     proxy: {
//       '/api': {
//         target: 'http://localhost:5000',
//         changeOrigin: true,
//         secure: false,
//       },
//     },
//   },
// });
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173, // Mantén el puerto predeterminado de Vite
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Proxy para el backend en el puerto 5000
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias para facilitar las importaciones
    },
  },
  build: {
    outDir: 'dist', // Carpeta de salida para la versión de producción
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'), // Archivo de entrada principal
    },
  },
});
