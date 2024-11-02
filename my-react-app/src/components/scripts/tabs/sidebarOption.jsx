import React from 'react';
import AgregarEstadistica from '../students/AgregarEstadistica';

const SidebarSwitch = ({ labels, contents, activeIndex, onToggle, alumnoId, onEstadisticaAgregada }) => {
  return (
    <div className="switch-wrapper">
      <div  style={{display:'flex', width:'100%', justifyContent:'space-between'}}>
        <div className="switch-container" style={{display:'flex'}}>
          <div
          className={`switch-option ${activeIndex === 0 ? 'active' : ''}`}
          onClick={() => onToggle(0)}
        >
          {labels[0]}
        </div>
        <div
          className={`switch-option ${activeIndex === 1 ? 'active' : ''}`}
          onClick={() => onToggle(1)}
        >
          {labels[1]}
        </div>
        </div>
        <div>
        <AgregarEstadistica alumnoId={alumnoId} onEstadisticaAgregada={onEstadisticaAgregada} />
        </div>
      </div>
      <div className="switch-content">
        {contents[activeIndex]}
      </div>
    </div>
  );
};

export default SidebarSwitch;
