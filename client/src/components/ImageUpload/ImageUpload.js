import React, { useState, useRef } from 'react';
import { Upload, Image, X, AlertCircle } from 'lucide-react';
import './ImageUpload.css'; // You'll need to create this CSS file

const ImageUpload = ({ 
  onImageUpload, 
  maxSizeInMB = 5, 
  acceptedFormats = ['image/jpeg', 'image/png'], // Restricted to JPG/PNG only
  className = '',
  placeholder = 'Drag and drop an image here, or click to select',
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.8
}) => {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return false;
    }

    if (!acceptedFormats.includes(file.type)) {
      setError(`Only JPG and PNG files are supported`);
      return false;
    }

    setError('');
    return true;
  };

  const compressImage = (file, targetMaxWidth = maxWidth, targetMaxHeight = maxHeight, targetQuality = quality) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;
        
        if (width > height) {
          if (width > targetMaxWidth) {
            height = (height * targetMaxWidth) / width;
            width = targetMaxWidth;
          }
        } else {
          if (height > targetMaxHeight) {
            width = (width * targetMaxHeight) / height;
            height = targetMaxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            // Create a new File object with the same name and type
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          file.type,
          targetQuality
        );
      };

      img.onerror = () => {
        resolve(file); // If compression fails, return original file
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const ensureFileSizeLimit = async (file) => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    
    if (file.size <= maxSizeInBytes) {
      return file; // File is already small enough
    }
    
    // Try different compression levels
    let currentQuality = quality;
    let compressedFile = file;
    let attempts = 0;
    const maxAttempts = 5;
    
    while (compressedFile.size > maxSizeInBytes && attempts < maxAttempts && currentQuality > 0.1) {
      currentQuality = Math.max(0.1, currentQuality - 0.1);
      compressedFile = await compressImage(file, maxWidth, maxHeight, currentQuality);
      attempts++;
    }
    
    return compressedFile;
  };

  const handleFileUpload = async (file) => {
    if (!validateFile(file)) return;

    setIsCompressing(true);
    setError('');

    try {
      console.log('Original file size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Compress the image
      const compressedFile = await ensureFileSizeLimit(file);
      
      console.log('Compressed file size:', (compressedFile.size / 1024 / 1024).toFixed(2), 'MB');
      
      // Check if compression was successful enough
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      if (compressedFile.size > maxSizeInBytes) {
        setError(`Unable to compress image below ${maxSizeInMB}MB. Try a smaller image.`);
        setIsCompressing(false);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = {
          file: compressedFile, // Use compressed file
          url: e.target.result,
          name: file.name, // Keep original name
          size: compressedFile.size, // Show compressed size
          originalSize: file.size, // Keep track of original size
          wasCompressed: file.size !== compressedFile.size
        };
        
        setUploadedImage(imageData);
        setIsCompressing(false);
        
        if (onImageUpload) {
          onImageUpload(imageData);
        }
      };
      
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error('Image compression failed:', err);
      setError('Failed to process image. Please try a different image.');
      setIsCompressing(false);
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
    if (!isCompressing) {
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

  return (
    <div className={`image-upload-container ${className}`}>
      {!uploadedImage ? (
        <div
          className={`upload-area ${isDragOver ? 'drag-over' : ''} ${error ? 'error' : ''} ${isCompressing ? 'processing' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
            disabled={isCompressing}
          />
          
          <div className="upload-content">
            <Upload 
              className={`upload-icon ${isDragOver ? 'drag-over' : ''} ${isCompressing ? 'processing' : ''}`}
              size={48}
            />
            <div className="upload-text">
              <p className={`upload-title ${isDragOver ? 'drag-over' : ''}`}>
                {isCompressing ? 'Compressing image...' : placeholder}
              </p>
              <p className="upload-subtitle">
                Maximum file size: {maxSizeInMB}MB (auto-compressed)
              </p>
              <p className="upload-formats">
                Supported formats: JPG, PNG
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
          >
            <X size={16} />
          </button>
          
          <div className="image-info">
            <div className="image-details">
              <Image size={16} className="info-icon" />
              <span className="image-name">
                {uploadedImage.name}
              </span>
              {uploadedImage.wasCompressed && (
                <span className="compression-badge">Compressed</span>
              )}
            </div>
            <div className="size-info">
              <p className="image-size">
                {formatFileSize(uploadedImage.size)}
              </p>
              {uploadedImage.wasCompressed && (
                <p className="original-size">
                  Original: {formatFileSize(uploadedImage.originalSize)}
                </p>
              )}
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