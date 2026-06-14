import { useState, useRef, useEffect } from "react";

/**
 * Single-request blur-up image: shows a blurred version of the same image
 * while it loads, then transitions to sharp. No extra thumbnail needed.
 */
export default function ProgressiveImage({
  src,
  alt = "",
  className = "",
  containerClassName = "",
  priority = false,
  aspectRatio,
  onLoad: onLoadProp,
}) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  // Handle browser-cached images that fire onLoad before mount
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    onLoadProp?.();
  };

  return (
    <div
      className={`relative overflow-hidden bg-muted ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      {src && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          decoding="async"
          loading={priority ? "eager" : "lazy"}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out ${
            loaded ? "blur-none scale-100" : "blur-xl scale-110"
          } ${className}`}
        />
      )}
    </div>
  );
}