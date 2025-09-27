// ImageWithFallback.js
import React, { useState } from "react";

const ImageWithFallback = ({ src, alt, className, onErrorFallback }) => {
  const [attempt, setAttempt] = useState(0);

  // Normalize the URL (strip any existing port)
  const normalizeUrl = (url, port) => {
    try {
      const u = new URL(url, window.location.origin);
      u.port = port;
      return u.toString();
    } catch {
      return url; // fallback if invalid
    }
  };

  const urlsToTry = [
    normalizeUrl(src, "3000"),
    normalizeUrl(src, "3001"),
  ];

  return (
    <img
      src={urlsToTry[attempt]}
      alt={alt}
      className={className}
      onError={() => {
        if (attempt < urlsToTry.length - 1) {
          setAttempt(attempt + 1); // try next port
        } else {
          if (onErrorFallback) onErrorFallback();
        }
      }}
    />
  );
};

export default ImageWithFallback;