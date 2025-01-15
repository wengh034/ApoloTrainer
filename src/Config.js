// export const getBaseUrl = () => {
//     const defaultPort = 5000; // Valor predeterminado en caso de que BACKEND_PORT no esté definido
//     const port = process.env.BACKEND_PORT || defaultPort; // Puerto dinámico
//     const host = process.env.NODE_ENV === 'development' ? 'http://localhost' : 'http://127.0.0.1';
//     return `${host}:${port}`;
//   };
  
// Config.js
export const getBaseUrl = () => {
  return window.electron.getBaseUrl(); // Obtener la URL desde preload.js
};
