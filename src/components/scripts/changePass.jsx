import React, { useState } from 'react';
import { getBaseUrl } from '@/Config.js';

const ChangePass = () => {
  const [username, setUsername] = useState(''); // Puedes obtener esto de la autenticación del usuario
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch(`${getBaseUrl()}/api/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, currentPassword, newPassword }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Contraseña cambiada satisfactoriamente');
      } else {
        setMessage(result.message);
      }
    } catch (error) {
      console.error('Error:', error); // Log del error
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div>
      <h3>Cambiar Contraseña</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Nombre de Usuario:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Contraseña Actual:
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Nueva Contraseña:
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </label>
        </div>
        <button type="submit">Cambiar Contraseña</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default ChangePass;
