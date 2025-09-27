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
    console.log('ImageUpload received initialImage:', initialImage); // Debug log
    if (initialImage && initialImage.url) {
      // For existing images from database, ensure we have proper image data
      const imageData = {
        ...initialImage,
        size: initialImage.size || 0,
        name: initialImage.name || 'Existing image',
        isExisting: true
      };
      console.log('ImageUpload setting image data:', imageData); // Debug log
      setUploadedImage(imageData);
    } else if (initialImage === null) {
      setUploadedImage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialImage]); // Only depend on initialImage, not uploadedImage

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
              alt={uploadedImage.name || 'Uploaded image'}
              className="preview-image"
              onError={(e) => {
                console.error('❌ Image URL failed:', e.target.src);
                
                const currentSrc = e.target.src;
                
                // Try fallback URL (React frontend - port 3000)
                if (uploadedImage.fallbackUrl && currentSrc !== uploadedImage.fallbackUrl) {
                  console.log('🔄 Trying fallback URL (port 3000):', uploadedImage.fallbackUrl);
                  e.target.src = uploadedImage.fallbackUrl;
                }
                // Try explicit frontend URL if different
                else if (uploadedImage.frontendUrl && currentSrc !== uploadedImage.frontendUrl && uploadedImage.frontendUrl !== uploadedImage.fallbackUrl) {
                  console.log('🔄 Trying explicit frontend URL:', uploadedImage.frontendUrl);
                  e.target.src = uploadedImage.frontendUrl;
                }
                // Try explicit backend URL if we haven't tried it yet
                else if (uploadedImage.backendUrl && currentSrc !== uploadedImage.backendUrl) {
                  console.log('🔄 Trying explicit backend URL:', uploadedImage.backendUrl);
                  e.target.src = uploadedImage.backendUrl;
                }
                else {
                  console.error('💥 All URLs failed:', {
                    primary: uploadedImage.url,
                    fallback: uploadedImage.fallbackUrl,
                    frontend: uploadedImage.frontendUrl,
                    backend: uploadedImage.backendUrl,
                    original: uploadedImage.originalPath
                  });
                  setError('Failed to load image. The image may have been moved or deleted.');
                  e.target.style.display = 'none';
                }
              }}
              onLoad={(e) => {
  console.log('✅ Image loaded successfully from:', e.target.src);
  setError(''); // Clear any previous errors
}}
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
                {uploadedImage.name || 'Image'}
              </span>
              {uploadedImage.isExisting && (
                <span className="existing-badge" style={{ 
                  background: '#e3f2fd', 
                  color: '#1976d2', 
                  padding: '2px 8px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  marginLeft: '8px'
                }}>
                  Current
                </span>
              )}
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