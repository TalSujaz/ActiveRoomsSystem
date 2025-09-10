import React, { useState } from 'react';
import './BuildingButton.css';

const BuildingButton = ({ building, status, onClick, position }) => {
  const [isHovered, setIsHovered] = useState(false);

const getStatusText = () => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'alert':
      return 'Alert';
    case 'inactive':
      return 'Inactive';
    default:
      return 'Unknown';
  }
};

  

  const handleClick = (e) => {
    e.stopPropagation();
    onClick(building.id);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div 
      className={`building-button ${status} ${isHovered ? 'hovered' : ''}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      title={`${building.name} - ${getStatusText()}`}
    >
      {/* Main Building Icon */}
      <div className="building-icon">
        <div className="building-symbol">{getBuildingIcon()}</div>
      </div>

      {/* Building Info Tooltip */}
      <div className={`building-info ${isHovered ? 'visible' : ''}`}>
        <div className="building-info-header">
          <h4 className="building-name">{building.name}</h4>
          <span className={`status-badge ${status}`}>
            {getStatusText()}
          </span>
        </div>
        
        {building.description && (
          <p className="building-description">
            {building.description.length > 60 
              ? building.description.substring(0, 60) + '...' 
              : building.description}
          </p>
        )}
        
        <div className="building-details">
          <div className="detail-item">
            <span className="detail-text">{building.floorCount || 0} floors</span>
          </div>
          <div className="detail-item">
            <span className="detail-text">{building.sensorCount || 0} sensors</span>
          </div>
        </div>

        <div className="building-action">
        <span className="action-text">Click to view</span>
          <span className="action-arrow">→</span>
        </div>

        {/* Tooltip Arrow */}
        <div className="tooltip-arrow"></div>
      </div>

      {/* Pulse Animation for Active/Alert */}
      {(status === 'active' || status === 'alert') && (
        <div className={`building-pulse ${status}`}></div>
      )}

      {/* Alert Badge */}
      {status === 'alert' && (
        <div className="alert-badge">
          <span>!</span>
        </div>
      )}
    </div>
  );
};

export default BuildingButton;