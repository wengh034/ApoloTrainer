import React from 'react';

const BackButton = ({ onBack }) => {
  return (
    <button type='button' onClick={onBack}>
      <img src="./assets/arrow_back_ios_24dp_FILL0_wght400_GRAD0_opsz24.svg" alt="atrás" />
    </button>
  );
};

export default BackButton;
