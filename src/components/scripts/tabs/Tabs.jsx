import React, { useState } from 'react'; 

const Tabs = ({ tabLabels, tabContents, onTabChange }) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index) => {
    setActiveTab(index);
   
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <div className='tabs' style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className='tab-headers'>
        {tabLabels.map((label, index) => (
          <button
            key={index}
            className={`tab-button ${index === activeTab ? 'active' : ''}`}
            onClick={() => handleTabChange(index)} // Usa el nuevo manejador
            style={{color:'#c3c5c9' }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className='tab-content-component' style={{ flex: '1 1 auto'}}>
        {tabContents[activeTab]}
      </div>
    </div>
  );
};

export default Tabs;
