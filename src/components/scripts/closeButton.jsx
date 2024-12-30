import React from 'react';
import PropTypes from 'prop-types';

const CloseButton = ({ onClick }) => {
  return (
    <button type='button' onClick={onClick} style={{
    }}>
       <img src="./assets/close_24dp_FILL0_wght400_GRAD0_opsz24.svg" alt="Cerrar" />
    </button>
  );
};

CloseButton.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default CloseButton;
