import React from 'react';

const SettingContent = ({ onOptionClick }) => {
  return (
    <div>
      <h3>Configuración</h3>
      <div>
        <p><b>Usuario:</b></p>
        <div>
          <ul>
            <li onClick={() => onOptionClick('changePassword')} style={{ cursor: 'pointer' }}>
              Cambiar Contraseña
            </li>
          </ul>
        </div>
        <p><b>Datos y Respaldo:</b></p>
      </div>
    </div>
  );
};

export default SettingContent;
