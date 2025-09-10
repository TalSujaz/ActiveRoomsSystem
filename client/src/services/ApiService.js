const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

class ApiService {
  static async makeRequest(url, options = {}) {
  try {
    const isFormData = options.body instanceof FormData;

    const config = {
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Try parsing JSON, but return raw text if not JSON
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

  static async getAllAreas() {
    return this.makeRequest('/areas');
  }

  static async getAreaById(id) {
    return this.makeRequest(`/areas/${id}`);
  }

  static async getFloorsByBuildingId(buildingId) {
    const allAreas = await this.getAllAreas();
    return allAreas.filter(area => 
      area.area_type === 'floor' && area.inside_of === buildingId
    );
  }

  static async getAllBuildings() {
    try {
      const allAreas = await this.getAllAreas();
      const buildings = allAreas.filter(area => area.area_type === 'building');
      
      const transformedBuildings = await Promise.all(
        buildings.map(async (building) => {
          try {
            const floors = await this.getFloorsByBuildingId(building.id);
            
            return {
              id: building.id,
              name: building.name,
              description: building.description,
              imageUrl: building.image_path,
              floors: await Promise.all(
                floors.map(async (floor) => {
                  try {
                    const floorSensors = await this.getSensorsByAreaId(floor.id);
                    return {
                      id: floor.id,
                      name: floor.name,
                      floorImageUrl: floor.image_path,
                      sensors: floorSensors.map(sensor => ({
                        id: sensor.id,
                        name: sensor.name,
                        x: sensor.coordinates?.x || 50,
                        y: sensor.coordinates?.y || 50,
                        occupied: sensor.status === 'active',
                        count: sensor.coordinates?.count || 0,
                        maxCapacity: sensor.coordinates?.maxCapacity || 30
                      }))
                    };
                  } catch (error) {
                    return {
                      id: floor.id,
                      name: floor.name,
                      floorImageUrl: floor.image_path,
                      sensors: []
                    };
                  }
                })
              )
            };
          } catch (error) {
            return {
              id: building.id,
              name: building.name,
              description: building.description,
              imageUrl: building.image_path,
              floors: []
            };
          }
        })
      );
      
      return transformedBuildings;
    } catch (error) {
      console.error('Error in getAllBuildings:', error);
      throw error;
    }
  }

  static async createArea(areaData) {
  return this.makeRequest('/areas', {
    method: 'POST',
    body: JSON.stringify(areaData),
  });
}

  static async updateArea(id, areaData) {
    return this.makeRequest(`/areas/${id}`, {
      method: 'PUT',
      body: JSON.stringify(areaData),
    });
  }

  static async updateAreaWithImage(id, areaData, imageFile) {
  const formData = new FormData();

  // Add text fields to FormData
  Object.keys(areaData).forEach(key => {
    if (areaData[key] !== null && areaData[key] !== undefined) {
      formData.append(key, areaData[key]);
    }
  });

  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }

  // Make the request with fetch (skip JSON headers for FormData)
  try {
    const response = await fetch(`${API_BASE_URL}/areas/${id}`, {
      method: 'PUT',
      body: formData,
      // Do not set Content-Type; browser will set correct boundary
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to update area with image:', error);
    throw error;
  }
}

  static async deleteArea(id) {
    return this.makeRequest(`/areas/${id}`, {
      method: 'DELETE',
    });
  }

static async createAreaWithImage(areaData, imageFile) {
  const formData = new FormData();

  // Add text fields to FormData
  Object.keys(areaData).forEach(key => {
    if (areaData[key] !== null && areaData[key] !== undefined) {
      formData.append(key, areaData[key]);
    }
  });

  // Add image file if provided
  if (imageFile) {
    formData.append('image', imageFile);
  }

  // Make the request directly with fetch instead of makeRequest
  // so we can skip JSON headers
  try {
    const response = await fetch(`${API_BASE_URL}/areas`, {
      method: 'POST',
      body: formData,
      // DO NOT set Content-Type here
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to create area with image:', error);
    throw error;
  }
}
  
  static async getAllSensors() {
    return this.makeRequest('/sensors');
  }

  static async getSensorById(id) {
    return this.makeRequest(`/sensors/${id}`);
  }

  static async getSensorsByAreaId(areaId) {
    const allSensors = await this.getAllSensors();
    return allSensors.filter(sensor => sensor.area_id === areaId);
  }

  static async getSensorsByBuildingId(buildingId) {
    const floors = await this.getFloorsByBuildingId(buildingId);
    const allSensors = [];
    
    for (const floor of floors) {
      const floorSensors = await this.getSensorsByAreaId(floor.id);
      allSensors.push(...floorSensors);
    }
    
    return allSensors;
  }

  static async getAllSensorsStatus() {
    const sensors = await this.getAllSensors();
    const statusMap = {};
    
    sensors.forEach(sensor => {
      statusMap[sensor.id] = {
        id: sensor.id,
        areaId: sensor.area_id,
        status: sensor.status,
        name: sensor.name,
        alert: sensor.status === 'error' || sensor.status === 'offline',
        coordinates: sensor.coordinates
      };
    });
    
    return statusMap;
  }

  static async createSensor(sensorData) {
    return this.makeRequest('/sensors', {
      method: 'POST',
      body: JSON.stringify(sensorData),
    });
  }

  static async updateSensor(id, sensorData) {
    return this.makeRequest(`/sensors/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sensorData),
    });
  }

  static async updateSensorCoordinates(id, coordinates) {
    const sensor = await this.getSensorById(id);
    const updatedCoordinates = {
      ...sensor.coordinates,
      ...coordinates
    };
    
    return this.updateSensor(id, {
      ...sensor,
      coordinates: updatedCoordinates
    });
  }

  static async deleteSensor(id) {
    return this.makeRequest(`/sensors/${id}`, {
      method: 'DELETE',
    });
  }

  
  static async getAllUsers() {
    return this.makeRequest('/users');
  }

  static async getUserById(id) {
    return this.makeRequest(`/users/${id}`);
  }

  static async login(username, passwordHash) {
    return this.makeRequest(`/users/${username},${passwordHash}`);
  }

  static async createUser(userData) {
    return this.makeRequest('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  static async updateUser(id, userData) {
    return this.makeRequest(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  static async deleteUser(id) {
    return this.makeRequest(`/users/${id}`, {
      method: 'DELETE',
    });
  }
  static async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  static async getServerInfo() {
    return this.makeRequest('/info');
  }
}

export default ApiService;