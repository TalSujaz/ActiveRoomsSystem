import React, { useState, useRef } from 'react';
import { Upload, Image, X, AlertCircle } from 'lucide-react';
import './ImageUpload.css';

const ImageUpload = ({ 
  onImageUpload, 
  maxSizeInMB = 5, 
  acceptedFormats = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
  placeholder = 'Drag and drop an image here, or click to select',
  initialImage = null // New prop for existing image
}) => {
  const [uploadedImage, setUploadedImage] = useState(initialImage);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Update uploadedImage when initialImage prop changes
  React.useEffect(() => {
    setUploadedImage(initialImage);
  }, [initialImage]);

  const validateFile = (file) => {
    if (!file) return false;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    if (!acceptedFormats.includes(file.type)) {
      const formatNames = acceptedFormats.map(format => 
        format.split('/')[1].toUpperCase()
      ).join(', ');
      setError(`Only ${formatNames} files are supported`);
      return false;
    }

    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`File size must be less than ${maxSizeInMB}MB`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          file: file, // Use original file without compression
          url: e.target.result,
          name: file.name,
          size: file.size
        };
        
        setUploadedImage(imageData);
        setIsUploading(false);
        
        if (onImageUpload) {
          onImageUpload(imageData);
        }
      };
      
      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
        setIsUploading(false);
      };
      
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Image upload failed:', err);
      setError('Failed to process image. Please try a different image.');
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    if (onImageUpload) {
      onImageUpload(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAcceptString = () => {
    return acceptedFormats.join(',');
  };

  const getFormatDisplayNames = () => {
    return acceptedFormats.map(format => 
      format.split('/')[1].toUpperCase()
    ).join(', ');
  };

  return (
    <div className={`image-upload-container ${className}`}>
      {!uploadedImage ? (
        <div
          className={`upload-area ${isDragOver ? 'drag-over' : ''} ${error ? 'error' : ''} ${isUploading ? 'processing' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={getAcceptString()}
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={isUploading}
          />
          
          <div className="upload-content">
            <Upload 
              className={`upload-icon ${isDragOver ? 'drag-over' : ''} ${isUploading ? 'processing' : ''}`}
              size={48}
            />
            <div className="upload-text">
              <p className={`upload-title ${isDragOver ? 'drag-over' : ''}`}>
                {isUploading ? 'Uploading image...' : placeholder}
              </p>
              <p className="upload-subtitle">
                Maximum file size: {maxSizeInMB}MB
              </p>
              <p className="upload-formats">
                Supported formats: {getFormatDisplayNames()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="image-preview-container">
          <div className="image-wrapper">
            <img
              src={uploadedImage.url}
              alt={uploadedImage.name}
              className="preview-image"
            />
          </div>
          
          <button
            onClick={handleRemoveImage}
            className="remove-button"
            title="Remove image"
          >
            <X size={16} />
          </button>
          
          <div className="image-info">
            <div className="image-details">
              <Image size={16} className="info-icon" />
              <span className="image-name">
                {uploadedImage.name}
              </span>
            </div>
            <div className="size-info">
              <p className="image-size">
                {uploadedImage.isExisting ? 'Existing image' : formatFileSize(uploadedImage.size)}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;