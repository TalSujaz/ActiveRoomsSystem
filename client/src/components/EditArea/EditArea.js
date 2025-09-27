// EditArea.js
import React, { useState, useCallback } from 'react';
import ApiService from '../../services/ApiService';
import ImageUpload from '../ImageUpload/ImageUpload';
import './EditArea.css';
import { useEffect } from 'react';

// Validation utilities
export const validateBuildingForm = (buildingName, description) => {
  const errors = {};
  
  if (!buildingName || buildingName.trim() === '') {
    errors.buildingName = 'Building name is required';
  }
  
  if (!description || description.trim() === '') {
    errors.description = 'Description is required';
  }
  
  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
};

const EditArea = ({ 
  initialData = { 
    buildingName: '', 
    description: '',
    image: null
  },
  areaType,
  areaId = null,
  parentId = null,  
  onSave = () => {},
  onCancel = () => {},
  title = null,
  className = ''
}) => {
  const [buildingName, setBuildingName] = useState(initialData.buildingName);
  const [description, setDescription] = useState(initialData.description);
  const [uploadedImage, setUploadedImage] = useState(initialData.image);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const labels = areaType === "floor" 
  ? {
      title: areaId? "Edit Floor Details": "Add Floor Details",
      nameLabel: "Floor Name *",
      namePlaceholder: "Enter floor name",
      descriptionLabel: "Description *",
      descriptionPlaceholder: "Enter floor description",
      imageLabel: "Floor Image",
      successMessage: "Floor created successfully!",
    }
  : {
      title: areaId? "Edit Building Details": "Add Building Details",
      nameLabel: "Building Name *",
      namePlaceholder: "Enter building name",
      descriptionLabel: "Description *",
      descriptionPlaceholder: "Enter building description",
      imageLabel: "Building Image",
      successMessage: "Building created successfully!",
    };

  useEffect(() => {
    if (areaId) {
      // fetch area details from API
      const fetchArea = async () => {
        setIsLoading(true);
        try {
          const areaData = await ApiService.getAreaById(areaId);
          setBuildingName(areaData.name || '');
          setDescription(areaData.description || '');
          
          // Handle existing image
          if (areaData.image_path) {
            console.log('Found existing image path:', areaData.image_path); // Debug log
            
            // Fix the image URL - prepend API base URL if it's a relative path
            let imageUrl = areaData.image_path;
            if (imageUrl.startsWith('/assets') || imageUrl.startsWith('assets')) {
              // Your backend is on port 3001 and serves static files from public folder
              const API_BASE = 'http://localhost:3001';
              imageUrl = imageUrl.startsWith('/') ? `${API_BASE}${imageUrl}` : `${API_BASE}/${imageUrl}`;
            }
            
            console.log('Original image path:', areaData.image_path);
            console.log('Final constructed URL:', imageUrl);
            
            // Create image data object that matches what ImageUpload expects
            const existingImageData = {
              url: imageUrl,
              name: areaData.name ? `${areaData.name}-image` : 'existing-image',
              size: 0, // We don't know the actual file size from URL
              isExisting: true // Flag to indicate this is an existing image
            };
            
            console.log('Setting existing image data:', existingImageData); // Debug log
            console.log('Final image URL will be:', imageUrl); // Debug log
            setUploadedImage(existingImageData);
          } else {
            console.log('No existing image found'); // Debug log
            setUploadedImage(null);
          }
        } catch (err) {
          console.error(`Failed to load ${areaType} details:`, err);
          alert(`Failed to load ${areaType} details. Please try again.`);
        } finally {
          setIsLoading(false);
        }
      };
      fetchArea();
    }
  }, [areaId, areaType]);

  // Validate form whenever inputs change
  const { isValid } = validateBuildingForm(buildingName, description);

  const handleBlur = useCallback((fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    // Validate only the touched field
    const validation = validateBuildingForm(buildingName, description);
    setErrors(validation.errors);
  }, [buildingName, description]);

  const handleBuildingNameChange = useCallback((e) => {
    setBuildingName(e.target.value);
    
    // Clear error when user starts typing
    if (errors.buildingName && e.target.value.trim()) {
      setErrors(prev => ({ ...prev, buildingName: null }));
    }
  }, [errors.buildingName]);

  const handleDescriptionChange = useCallback((e) => {
    setDescription(e.target.value);
    
    // Clear error when user starts typing
    if (errors.description && e.target.value.trim()) {
      setErrors(prev => ({ ...prev, description: null }));
    }
  }, [errors.description]);

  // Handle image upload from ImageUpload component
  const handleImageUpload = useCallback((imageData) => {
    setUploadedImage(imageData);
  }, []);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const handleSave = useCallback(async () => {
    const validation = validateBuildingForm(buildingName, description);
    setErrors(validation.errors);
    setTouched({ buildingName: true, description: true });

    if (!validation.isValid) return;

    const areaData = {
      name: buildingName.trim(),
      area_type: areaType,
      description: description.trim(),
      inside_of: parentId || null,
    };

    try {
      if (areaId) {
        // Update existing area
        if (uploadedImage?.file) {
          // User uploaded a new image file
          await ApiService.updateAreaWithImage(areaId, areaData, uploadedImage.file);
        } else if (uploadedImage?.url && uploadedImage.isExisting) {
          // Keep existing image
          areaData.image_path = uploadedImage.url;
          await ApiService.updateArea(areaId, areaData);
        } else if (uploadedImage === null) {
          // User removed the image
          areaData.image_path = null;
          await ApiService.updateArea(areaId, areaData);
        } else {
          // No image changes
          await ApiService.updateArea(areaId, areaData);
        }
        alert(`${areaType === "floor" ? "Floor" : "Building"} updated successfully!`);
      } else {
        // Create new area
        if (uploadedImage?.file) {
          await ApiService.createAreaWithImage(areaData, uploadedImage.file);
        } else {
          areaData.image_path = uploadedImage?.url || null; 
          await ApiService.createArea(areaData);
        }
        alert(`${areaType === "floor" ? "Floor" : "Building"} created successfully!`);
      }

      onSave(areaData);
      onCancel();
    } catch (err) {
      console.error(`Failed to save ${areaType}:`, err);
      alert(`Failed to save ${areaType}. See console for details.`);
    }
  }, [buildingName, description, uploadedImage, areaType, parentId, areaId, onSave, onCancel]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && e.ctrlKey && isValid) {
      handleSave();
    }
  }, [isValid, handleSave]);

  if (isLoading) {
    return (
      <div className="edit-building-overlay">
        <div className={`edit-building ${className}`.trim()}>
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <p>Loading {areaType} details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-building-overlay">
      <div className={`edit-building ${className}`.trim()}>
        <h2 className="edit-building__title">{labels.title}</h2>
        
        <div className="edit-building__container">
          <div className="edit-building__field">
            <label htmlFor="buildingName" className="edit-building__label">
              {labels.nameLabel}
            </label>
            <input
              id="buildingName"
              type="text"
              value={buildingName}
              onChange={handleBuildingNameChange}
              onBlur={() => handleBlur('buildingName')}
              onKeyDown={handleKeyPress}
              className={`edit-building__input ${
                touched.buildingName && errors.buildingName ? 'edit-building__input--error' : ''
              }`}
              placeholder={labels.namePlaceholder}
              data-testid="building-name-input"
              maxLength={100}
            />
            {touched.buildingName && errors.buildingName && (
              <span className="edit-building__error" data-testid="building-name-error">
                {errors.buildingName}
              </span>
            )}
          </div>

          <div className="edit-building__field">
            <label htmlFor="description" className="edit-building__label">
              {labels.descriptionLabel}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => handleBlur('description')}
              onKeyDown={handleKeyPress}
              className={`edit-building__input edit-building__textarea ${
                touched.description && errors.description ? 'edit-building__input--error' : ''
              }`}
              placeholder={labels.descriptionPlaceholder}
              data-testid="description-input"
              maxLength={500}
              rows={4}
            />
            {touched.description && errors.description && (
              <span className="edit-building__error" data-testid="description-error">
                {errors.description}
              </span>
            )}
          </div>

          {/* Add the ImageUpload component */}
          <div className="edit-building__field">
            <label className="edit-building__label">
              {labels.imageLabel}
            </label>
            <ImageUpload
              onImageUpload={handleImageUpload}
              maxSizeInMB={5}
              acceptedFormats={['image/jpeg', 'image/png', 'image/gif', 'image/webp']}
              className="edit-building__image-upload"
              placeholder="Upload image"
              initialImage={uploadedImage} // Pass existing image to ImageUpload
            />
          </div>

          <div className="edit-building__buttons">
            <button
              type="button"
              onClick={handleCancel}
              className="edit-building__button edit-building__button--cancel"
              data-testid="cancel-button"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!isValid}
              className="edit-building__button edit-building__button--save"
              data-testid="save-button"
              title={!isValid ? 'Please fill all required fields' : 'Save changes (Ctrl+Enter)'}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditArea;