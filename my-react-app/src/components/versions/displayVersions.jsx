import React from 'react';
import { appVersion } from '../../version';

const VersionDisplay = () => {
  return (
    <div style={{ padding:'10px', fontSize:'0.8em'}}>
      <p style={{ margin:'0 1.5em 0 0'}}>Apolo Trainer v. {appVersion}</p>
    </div>
  );
};

export default VersionDisplay;
