/**
 * Compress image to a small thumbnail (~48px) for blur-up placeholder.
 */
async function compressThumbnail(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxDim = 48;
      let w = img.width;
      let h = img.height;
      if (w > h) { h = Math.round((h * maxDim) / w); w = maxDim; }
      else { w = Math.round((w * maxDim) / h); h = maxDim; }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Thumbnail toBlob failed"));
      }, "image/jpeg", 0.30);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

/**
 * Client-side image compression for display.
 * Scales to maxDimension (1500 for sharp retina feed), WebP at high quality.
 */
export async function compressImage(file, maxDimension = 1500, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      // Try WebP first, fall back to JPEG
      const mime = "image/webp";
      const blobPromise = canvas.toBlob ? 
        new Promise((res) => canvas.toBlob(res, mime, quality)) :
        Promise.resolve(null);
      
      blobPromise.then((webpBlob) => {
        if (webpBlob && webpBlob.size > 0) {
          resolve({ blob: webpBlob, width, height });
        } else {
          canvas.toBlob((jpegBlob) => {
            if (jpegBlob) resolve({ blob: jpegBlob, width, height });
            else reject(new Error("Canvas toBlob failed"));
          }, "image/jpeg", quality);
        }
      });
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

/**
 * Generate both a tiny thumbnail and compressed display image for a photo.
 */
export async function processPhotoForUpload(file) {
  const [thumbnailBlob, compressed] = await Promise.all([
    compressThumbnail(file),
    compressImage(file, 1500, 0.88),
  ]);
  return { thumbnailBlob, compressed };
}

/**
 * Get video duration in seconds from a File.
 */
export function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(video.duration);
    };
    video.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Video load failed")); };
    video.src = url;
  });
}

/**
 * Capture a thumbnail from a video File as a JPEG blob.
 */
export function captureVideoThumbnail(file, seekTime = 0.5) {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;
    video.onloadedmetadata = () => {
      video.currentTime = Math.min(seekTime, video.duration * 0.1);
    };
    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.7);
    };
    video.onerror = () => { URL.revokeObjectURL(url); resolve(null); };
    video.src = url;
  });
}

export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}