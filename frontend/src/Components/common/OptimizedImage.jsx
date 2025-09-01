import React, { useState, useRef, useEffect } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  placeholderSrc,
  effect = 'blur',
  threshold = 100,
  wrapperClassName = '',
  style = {},
  onClick,
  onLoad,
  onError,
  priority = false,
  sizes = '',
  srcSet = '',
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc || src);
  const imgRef = useRef(null);

  // Handle image load
  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onLoad) onLoad();
  };

  // Handle image error
  const handleImageError = () => {
    setHasError(true);
    if (onError) onError();

    // Fallback to placeholder if available
    if (placeholderSrc && imageSrc !== placeholderSrc) {
      setImageSrc(placeholderSrc);
    }
  };

  // Generate responsive srcSet if not provided
  const generateSrcSet = () => {
    if (srcSet) return srcSet;

    if (src && !src.includes('http')) {
      // Generate different sizes for local images
      const baseUrl = src.replace(/\.[^/.]+$/, '');
      const extension = src.split('.').pop();

      return [
        `${baseUrl}-300.${extension} 300w`,
        `${baseUrl}-600.${extension} 600w`,
        `${baseUrl}-900.${extension} 900w`,
        `${baseUrl}-1200.${extension} 1200w`
      ].join(', ');
    }

    return '';
  };

  // Generate sizes attribute if not provided
  const generateSizes = () => {
    if (sizes) return sizes;

    if (width) {
      return `(max-width: 768px) 100vw, ${width}px`;
    }

    return '100vw';
  };

  // Handle intersection observer for lazy loading
  useEffect(() => {
    if (priority) {
      setIsLoaded(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: threshold / 100,
        rootMargin: '50px'
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, priority, threshold]);

  // If priority is true, render immediately without lazy loading
  if (priority) {
    return (
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`optimized-image ${className} ${isLoaded ? 'loaded' : ''}`}
        width={width}
        height={height}
        style={style}
        onClick={onClick}
        onLoad={handleImageLoad}
        onError={handleImageError}
        sizes={generateSizes()}
        srcSet={generateSrcSet()}
        {...props}
      />
    );
  }

  // Render with lazy loading
  return (
    <div
      ref={imgRef}
      className={`optimized-image-wrapper ${wrapperClassName}`}
      style={{ width, height, ...style }}
    >
      <LazyLoadImage
        src={imageSrc}
        alt={alt}
        className={`optimized-image ${className} ${isLoaded ? 'loaded' : ''}`}
        effect={effect}
        threshold={threshold}
        width={width}
        height={height}
        onClick={onClick}
        onLoad={handleImageLoad}
        onError={handleImageError}
        sizes={generateSizes()}
        srcSet={generateSrcSet()}
        placeholder={
          <div
            className="image-placeholder"
            style={{
              width: width || '100%',
              height: height || '200px',
              backgroundColor: '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#999'
            }}
          >
            <span>Loading...</span>
          </div>
        }
        {...props}
      />

      {/* Loading indicator */}
      {!isLoaded && !hasError && (
        <div className="image-loading">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="image-error">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
