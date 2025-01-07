import React from 'react';
import SVGComponent from '../SVGComponent';

const Watermark = () => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '70%',
        opacity: 0.1, // Transparencia de la marca de agua
        zIndex: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center', // Centra verticalmente
        // transform: 'rotate(-45deg)', // Rotación de 45 grados
      }}
    >
      {/* <SVGComponent src="./assets/logo-1.svg" color="red" /> */}
    </div>
  );
};

export default Watermark;
