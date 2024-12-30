import React from 'react';

const LoadingScreen = () => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      backgroundColor: '#111827'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          border: '4px solid #111827',
          borderRadius: '50%',
          borderTop: '4px solid #ffc107',
          width: '30px',
          height: '30px',
          animation: 'spin 1s linear infinite',
          margin: 'auto'
        }}></div>
        <div style={{ marginTop: '10px', fontSize: '18px', color: '#555' }}>
          Cargando...
        </div>
      </div>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default LoadingScreen;
