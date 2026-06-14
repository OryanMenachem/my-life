import { useState, useRef, useEffect } from "react";

/**
 * Two-layer cross-fade: a blurred placeholder underneath, and a sharp
 * image that fades in on top once decoded. Same src for both so the
 * browser reuses a single network request.
 */
export default function ProgressiveImage({
  src,
  placeholderSrc,
  alt = "",
  className = "",
  containerClassName = "",
  priority = false,
  aspectRatio,
  onLoad: onLoadProp,
}) {
  const blurSrc = placeholderSrc || src;
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const sharpRef = useRef(null);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  // Catch browser-cached images whose onLoad fires before mount
  useEffect(() => {
    const el = sharpRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [src]);

  const handleLoad = () => {
    setLoaded(true);
    onLoadProp?.();
  };

  const handleError = () => setError(true);

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
      {/* Blurred placeholder — tiny thumbnail, fades out when sharp image is ready */}
      <img
        src={blurSrc}
        alt=""
        aria-hidden="true"
        decoding="async"
        className={`absolute inset-0 w-full h-full object-cover blur-lg scale-110 transition-opacity duration-[300ms] ease-in-out ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* Sharp image — fades in on top */}
      <img
        ref={sharpRef}
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
        loading={priority ? "eager" : "lazy"}
        className={`w-full h-full object-cover transition-opacity duration-[300ms] ease-in-out ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </div>
  );
}