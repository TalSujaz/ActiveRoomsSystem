import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ApiService from '../../services/ApiService';
import './CampusMapView.css';
import EditArea from '../EditArea/EditArea';
import DeleteArea from '../DeleteArea/DeleteArea';

const CampusMapView = () => {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [sensorsStatus, setSensorsStatus] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditArea, setShowEditArea] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState(null);
  const [parentId, setParentId] = useState(null);
  const [areaId, setAreaId] = useState(null);
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const menuItems = [
    {
      title: 'Help',
      action: () => navigate('/help')
    },
    {
      title: 'Staff',
      action: () => navigate('/staff')
    },

    {
      title: 'Contact',
      action: () => navigate('/contact')
    },
    {
      title: 'Settings',
      action: () => navigate('/settings')
    },
    {
      title: 'Admin',
      action: () => navigate('/adminpanel')
    },
    {
      title: 'Home ',
      action: () => navigate('/')
    },


  ];

  useEffect(() => {
    loadCampusData();
  }, []);

  const loadCampusData = async () => {
    try {
      setLoading(true);
      setError(null);

      const buildingsData = await ApiService.getAllBuildings();
      console.log('Buildings data received:', buildingsData);

      if (buildingsData && buildingsData.length > 0) {
        setBuildings(buildingsData);
        setError(null);
      } else {
        setError(null);
        setBuildings([]);
      }
    } catch (err) {
      console.error('Error loading campus data:', err);
      if (err.message.includes('fetch') || err.message.includes('network') || err.message.includes('Failed to')) {
        setError('Server error');
      } else {
        console.warn('Non-critical error loading campus data:', err);
        setBuildings([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuildingClick = (building) => {
    setSelectedBuilding(building);
    if (building.floors && building.floors.length > 0) {
      setSelectedFloor(building.floors[0]);
    }
  };

  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
  };

  const handleSensorClick = (sensor) => {
    alert(`${sensor.name}\n status: ${sensor.occupied ? 'active' : ' inactive'}\n count : ${sensor.count}/${sensor.maxCapacity}`);
  };

  const handleBackToBuildings = () => {
    setSelectedBuilding(null);
    setSelectedFloor(null);
  };

  const handleConfirmDelete = async (area) => {
    try {
      await ApiService.deleteArea(area.id);  // API must accept floor id or building id

      if (area.parentId) {
        // Floor delete
        setBuildings(prev =>
            prev.map(b =>
                b.id === area.parentId
                    ? { ...b, floors: b.floors.filter(f => f.id !== area.id) }
                    : b
            )
        );
        if (selectedFloor?.id === area.id) {
          setSelectedFloor(null);
        }
      } else {
        // Building delete
        setBuildings(prev => prev.filter(b => b.id !== area.id));
      }
    } catch (err) {
      console.error("Error deleting area:", err);
    } finally {
      setIsDeleteOpen(false);
      setAreaToDelete(null);
    }
  };

  const handleDeleteBuildingClick = (building) => {
    setAreaToDelete(building);
    setIsDeleteOpen(true);
  };

  if(isDeleteOpen ){
    return (
        <div>
          { (
              <div className="popup-overlay">
                <div className="popup-content">
                  <DeleteArea
                      building={areaToDelete}
                      onConfirm={handleConfirmDelete}
                      onCancel={() => setIsDeleteOpen(false)}
                  />
                </div>
              </div>
          )}
        </div>
    );
  }

  const handleDeleteFloorClick = (floorId, buildingId) => {
    setAreaToDelete({ id: floorId, parentId: buildingId });
    setIsDeleteOpen(true);
  };

  if (loading) {
    return (
        <div className="campus-map-view">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>  loading information...</p>
          </div>
        </div>
    );
  }

  const handleAddBuildingClick = () => {
    setAreaId(null);       // reset areaId for new building
    setParentId(null);     // reset parentId because building has no parent
    setShowEditArea(true);
  };
  if (showEditArea) {
    return (
        <div className="popup-overlay">
          <div className="popup-content">
            <EditArea
                areaType={parentId ? "floor" : "building"}
                parentId={parentId}
                areaId={areaId}
                onSave={(data) => {
                  console.log(parentId ? "Saved floor:" : "Saved building:", data);
                }}
                onCancel={() => {
                  setShowEditArea(false);
                  setParentId(null);
                }}
            />
          </div>
        </div>
    );
  }

  const handleAddFloorClick = (ParentId) => {
    setAreaId(null);       // reset areaId for new floor
    setParentId(ParentId); // link to the parent building
    setShowEditArea(true);
  };

  const handleEditBuildingClick = (AreaId) => {
    setAreaId(AreaId);
    setParentId(null);     // editing a building → no parent
    setShowEditArea(true);
  };

  const handleEditFloorClick = (AreaId, ParentId) => {
    setAreaId(AreaId);
    setParentId(ParentId); // FIX: use ParentId from argument, not state
    setShowEditArea(true);
  };

  if (error) {
    return (
        <div className="campus-map-view">
          <div className="error-container">
            <p className="error-message">{error}</p>
            <button onClick={loadCampusData} className="retry-button">
              try again
            </button>
          </div>
        </div>
    );
  }

  if (!buildings || buildings.length === 0) {
    return (
        <div className="campus-map-view">
          {/* Header Navigation */}
          <header className="campus-header">
            <div className="header-container">
              <div className="header-actions">
                {isAuthenticated ? (
                    <>
                      <div className="user-info" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'white',
                        fontSize: '0.9rem',
                        marginLeft: '1rem'
                      }}>
                        <span>שלום, {user?.username}</span>
                        <span style={{
                          background: 'rgba(76, 175, 80, 0.3)',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          border: '1px solid rgba(76, 175, 80, 0.5)'
                        }}>
                      {user?.user_type === 'admin' ? 'מנהל' :
                          user?.user_type === 'maintainer' ? 'תחזוקאי' : 'משתמש'}
                    </span>
                      </div>
                      <button
                          className="user-profile"
                          onClick={logout}
                          style={{
                            background: 'rgba(244, 67, 54, 0.2)',
                            color: '#ff6b6b',
                            border: '1px solid rgba(244, 67, 54, 0.4)'
                          }}
                      >
                        <span>התנתק</span>
                      </button>
                    </>
                ) : (
                    <button
                        className="user-profile"
                        onClick={() => navigate('/login')}
                    >
                      <span>Login</span>
                    </button>
                )}
              </div>

              <nav className="main-navigation">
                {menuItems.map((item, index) => (
                    <button
                        key={index}
                        className={`nav-item ${item.isActive ? 'active' : ''}`}
                        onClick={item.action}
                    >
                      <span className="nav-title">{item.title}</span>
                    </button>
                ))}
              </nav>

              <div className="logo-section">
                <div className="logo">
                  <span className="logo-text">SMART CAMPUS</span>
                  <img
                      src="/assets/images/hit-logo.webp"
                      alt="HIT Logo"
                      className="logo-hit"
                  />
                </div>
              </div>
            </div>
          </header>

          <div className="main-content">
            <div className="buildings-section">
              <div className="section-header">
                <h1>No buildings available</h1>
                <p>No buildings were found in the system. Please contact the administrator.</p>
              </div>

              <button onClick={loadCampusData} className="retry-button">
                refresh data
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div className="campus-map-view">
        {/* Header Navigation */}
        <header className="campus-header">
          <div className="header-container">
            <div className="header-actions">
              {isAuthenticated ? (
                  <>
                    <div className="user-info" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      color: 'white',
                      fontSize: '0.9rem',
                      marginLeft: '1rem'
                    }}>
                      <span>שלום, {user?.username}</span>
                      <span style={{
                        background: 'rgba(76, 175, 80, 0.3)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        border: '1px solid rgba(76, 175, 80, 0.5)'
                      }}>
                    {user?.user_type === 'admin' ? 'מנהל' :
                        user?.user_type === 'maintainer' ? 'תחזוקאי' : 'משתמש'}
                  </span>
                    </div>
                    <button
                        className="user-profile"
                        onClick={logout}
                        style={{
                          background: 'rgba(244, 67, 54, 0.2)',
                          color: '#ff6b6b',
                          border: '1px solid rgba(244, 67, 54, 0.4)'
                        }}
                    >
                      <span>התנתק</span>
                    </button>
                  </>
              ) : (
                  <button
                      className="user-profile"
                      onClick={() => navigate('/login')}
                  >
                    <span>Login</span>
                  </button>
              )}
            </div>

            <nav className="main-navigation">
              {menuItems.map((item, index) => (
                  <button
                      key={index}
                      className={`nav-item ${item.isActive ? 'active' : ''}`}
                      onClick={item.action}
                  >
                    <span className="nav-title">{item.title}</span>
                  </button>
              ))}
            </nav>

            <div className="logo-section">
              <div className="logo">
                <span className="logo-text">SMART CAMPUS</span>
                <img
                    src="/assets/images/hit-logo.webp"
                    alt="HIT Logo"
                    className="logo-hit"
                />
              </div>
            </div>
          </div>
        </header>

        <div className="main-content">
          {!selectedBuilding ? (
              /* Buildings List */
              <div className="buildings-section">
                <div className="section-header">
                  <div className="section-text">
                    <h1> Choose a building</h1>
                    <p>Select a building to see activities </p>
                  </div>
                  <div className="section-action">
                    <p align="right">
                      <button className="add-building-btn" onClick={handleAddBuildingClick}>
                        Add Building
                      </button>
                    </p>
                  </div>
                </div>

                <div className="buildings-grid">
                  {buildings.map((building) => (
                      <div
                          key={building.id}
                          className="building-card"
                          onClick={() => handleBuildingClick(building)}
                      >
                        <div className="building-image">
                          <img
                              src={building.imageUrl}
                              alt={building.name}
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                          />
                          <div className="image-placeholder" style={{display: 'none'}}>
                            <span> building picture</span>
                          </div>
                        </div>

                        <div className="building-info">
                          <div className="building-text">
                            <h3>{building.name}</h3>
                            <p>{building.description}</p>
                            <div className="building-stats">
                              <span>floors: {building.floors ? building.floors.length : 0}</span>
                              <span>rooms: {building.floors ? building.floors.reduce((total, floor) => total + (floor.sensors ? floor.sensors.length : 0), 0) : 0}</span>
                            </div>
                          </div>
                          <div className="building-actions">
                            <button className="add-delete-btn" onClick={(e) => {
                              e.stopPropagation(); // Prevent parent click
                              handleDeleteBuildingClick(building);
                            }}>Delete</button>
                            <button className="add-edit-btn" onClick={(e) => {
                              e.stopPropagation(); // Prevent parent click
                              handleEditBuildingClick(building.id);
                            }}>Edit</button>
                          </div>
                        </div>
                      </div>
                  ))}
                </div>
              </div>
          ) : (
              /* Floor View */
              <div className="floor-section">
                <div className="floor-header">
                  <button className="back-button" onClick={handleBackToBuildings}>
                    return
                  </button>
                  <div className="floor-title">
                    <h1>{selectedBuilding.name}</h1>
                    <p>{selectedBuilding.description}</p>
                  </div>
                </div>

                {/* Floor Selection */}
                {selectedBuilding.floors && selectedBuilding.floors.length > 0 ? (
                    <>
                      <div className="floor-tabs">
                        {selectedBuilding.floors.map((floor) => (
                            <button
                                key={floor.id}
                                className={`floor-tab ${selectedFloor?.id === floor.id ? 'active' : ''}`}
                                onClick={() => handleFloorSelect(floor)}
                            >
                              {floor.name}
                            </button>
                        ))}

                        <button className="floor-tab" onClick={() => handleAddFloorClick(selectedBuilding.id)}>
                          Add floor
                        </button>
                      </div>

                      {/* Floor Map */}
                      {selectedFloor && (
                          <div className="floor-map-container">
                            <div className="floor-map">
                              <img
                                  src={selectedFloor.floorImageUrl}
                                  alt={`${selectedFloor.name} של ${selectedBuilding.name}`}
                                  className="floor-image"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                              />
                              <div className="floor-image-placeholder" style={{display: 'none'}}>
                                <span> floor picture</span>
                              </div>

                              {/* Sensors Overlay */}
                              <div className="sensors-overlay">
                                {selectedFloor.sensors && selectedFloor.sensors.map((sensor) => (
                                    <button
                                        key={sensor.id}
                                        className={`sensor-button ${sensor.occupied ? 'occupied' : 'empty'}`}
                                        style={{ left: `${sensor.x}%`, top: `${sensor.y}%` }}
                                        onClick={() => handleSensorClick(sensor)}
                                    >
                                      <div className="sensor-count">{sensor.count}</div>
                                      <div className="sensor-tooltip">
                                        <div className="tooltip-content">
                                          <strong>{sensor.name}</strong>
                                          <div>status: {sensor.occupied ? 'active' : 'inactive '}</div>
                                          <div>people: {sensor.count}/{sensor.maxCapacity}</div>
                                        </div>
                                      </div>
                                    </button>
                                ))}
                              </div>
                            </div>

                            {/* Floor Statistics */}
                            <div className="floor-stats">
                              <div className="stat-card">
                                <span className="stat-number">{selectedFloor.sensors ? selectedFloor.sensors.length : 0}</span>
                                <span className="stat-label">rooms</span>
                              </div>
                              <div className="stat-card">
                                <span className="stat-number">{selectedFloor.sensors ? selectedFloor.sensors.filter(s => s.occupied).length : 0}</span>
                                <span className="stat-label">active</span>
                              </div>
                              <div className="stat-card">
                                <span className="stat-number">{selectedFloor.sensors ? selectedFloor.sensors.reduce((total, s) => total + (s.count || 0), 0) : 0}</span>
                                <span className="stat-label">total </span>
                              </div>
                              <div className="floor-actions">
                                <button className="add-delete-btn" onClick={(e) => {handleDeleteFloorClick(selectedFloor.id, selectedBuilding.id);}}>Delete</button>
                                <button className="add-edit-btn" onClick={(e) => {handleEditFloorClick(selectedFloor.id, selectedBuilding.id);}}>Edit</button>
                              </div>
                            </div>
                          </div>
                      )}
                    </>
                ) : (
                    <div className="section-header">
                      <h2>No floors found for this building</h2>
                      <p>Please contact the administrator to add floors.</p>
                    </div>
                )}
              </div>
          )}
        </div>
      </div>
  );
};


export default CampusMapView;