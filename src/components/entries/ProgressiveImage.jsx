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
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);
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

  const handleError = () => {
    setError(true);
  };

  // Avoid conflicting position classes — callers supply absolute via containerClassName
  const needsRelative = !containerClassName.includes("absolute") && !containerClassName.includes("fixed");

  if (!src || error) {
    return (
      <div
        className={`overflow-hidden bg-muted ${containerClassName}`}
        style={aspectRatio ? { aspectRatio } : undefined}
      />
    );
  }

  return (
    <div
      className={`${needsRelative ? "relative" : ""} overflow-hidden bg-muted ${containerClassName}`}
      style={aspectRatio ? { aspectRatio } : undefined}
    >
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        className={`w-full h-full object-cover transition-all duration-700 ease-out ${
          loaded ? "blur-none scale-100" : "blur-xl scale-110"
        } ${className}`}
      />
    </div>
  );
}