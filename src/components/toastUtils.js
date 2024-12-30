import toast from 'react-hot-toast';

// Variable global para almacenar los audios preinicializados
const audioMap = {
  success: new Audio('./assets/sounds/Pop-1.m4a'),
  error: new Audio('./assets/sounds/Pop-1.m4a'),
};

export const showToast = (type, message) => {
  // Selecciona el audio correspondiente
  const audio = audioMap[type];
  
  if (audio) {
    // Intenta reproducir el audio
    audio.play().catch((err) => {
      console.error('Error al reproducir el sonido:', err);
    });
  }

  // Muestra el toast correspondiente
  if (type === 'error') {
    toast.error(message);
  } else {
    toast.success(message);
  }
};
