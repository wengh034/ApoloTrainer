import toast from 'react-hot-toast';

const audioMap = {
  success: new Audio('./assets/sounds/Pop-1.m4a'),
  error: new Audio('./assets/sounds/Pop-1.m4a'),
  custom: new Audio('./assets/sounds/Pop-1.m4a'),
};

export const showToast = (type, message, options = {}) => {
  const audio = audioMap[type];

  if (audio) {
    audio.play().catch((err) => {
      console.error('Error al reproducir el sonido:', err);
    });
  }

  if (type === 'error') {
    toast.error(message);
  } else if (type === 'success') {
    toast.success(message);
  } else if (type === 'custom') {
    toast(message, { duration: Infinity, ...options });
  }
};
