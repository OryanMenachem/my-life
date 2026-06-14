import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { compressImage, getVideoDuration, captureVideoThumbnail } from "@/utils/mediaUtils";

const MAX_VIDEO_SECONDS = 30;

/**
 * Manages a local media list with upload lifecycle per item.
 * Each item shape:
 *  { _localId, type, url, thumbnail_url, previewUrl, width, height,
 *    duration_seconds, sort_order, status: "uploading"|"ready"|"error" }
 *
 * initialMedia: array of already-saved media objects from an existing entry.
 */
export function useMediaUploader(initialMedia = []) {
  const [items, setItems] = useState(() =>
    initialMedia.map((m) => ({ ...m, status: "ready" }))
  );

  const updateItem = useCallback((localId, patch) => {
    setItems((prev) =>
      prev.map((it) => (it._localId === localId ? { ...it, ...patch } : it))
    );
  }, []);

  const removeItem = useCallback((localId) => {
    setItems((prev) => prev.filter((it) => it._localId !== localId));
  }, []);

  // Returns an error message string if the file should be rejected, else null.
  const validateFile = useCallback(async (file) => {
    const isVideo = file.type.startsWith("video/");
    if (isVideo) {
      try {
        const duration = await getVideoDuration(file);
        if (duration > MAX_VIDEO_SECONDS) {
          return `Video is ${Math.round(duration)}s — maximum is ${MAX_VIDEO_SECONDS}s.`;
        }
      } catch {
        // can't determine duration — allow it
      }
    }
    return null;
  }, []);

  const addFiles = useCallback(async (files) => {
    const errors = [];

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) continue;

      // Validate first (async for video duration)
      const err = await validateFile(file);
      if (err) { errors.push(err); continue; }

      const localId = `local_${Date.now()}_${Math.random()}`;
      const previewUrl = URL.createObjectURL(file);

      // Add placeholder immediately
      setItems((prev) => [
        ...prev,
        {
          _localId: localId,
          type: isVideo ? "video" : "photo",
          url: "",
          thumbnail_url: "",
          previewUrl,
          width: 0,
          height: 0,
          duration_seconds: 0,
          sort_order: prev.length,
          status: "uploading",
        },
      ]);

      // Upload in background
      (async () => {
        try {
          let uploadFile = file;
          let width = 0, height = 0, duration_seconds = 0, thumbnail_url = "";

          if (isImage) {
            const compressed = await compressImage(file);
            uploadFile = new File([compressed.blob], file.name, { type: "image/jpeg" });
            width = compressed.width;
            height = compressed.height;
          }

          if (isVideo) {
            try { duration_seconds = await getVideoDuration(file); } catch { /* ok */ }
            const thumbBlob = await captureVideoThumbnail(file);
            if (thumbBlob) {
              const thumbFile = new File([thumbBlob], "thumb.jpg", { type: "image/jpeg" });
              const thumbRes = await base44.integrations.Core.UploadFile({ file: thumbFile });
              thumbnail_url = thumbRes.file_url;
            }
          }

          const res = await base44.integrations.Core.UploadFile({ file: uploadFile });

          updateItem(localId, {
            url: res.file_url,
            thumbnail_url: thumbnail_url || "",
            width,
            height,
            duration_seconds,
            status: "ready",
          });
        } catch {
          updateItem(localId, { status: "error" });
        }
      })();
    }

    return errors;
  }, [updateItem, validateFile]);

  const retryItem = useCallback(async (localId) => {
    // For now just mark as error so user knows — full retry would need the original file
    // which we don't hold in memory. Removing is the graceful path.
    updateItem(localId, { status: "error" });
  }, [updateItem]);

  // Returns the media array ready to persist (only "ready" items, without local fields)
  const readyMedia = items
    .filter((it) => it.status === "ready")
    .map(({ _localId, previewUrl, status, ...rest }, idx) => ({
      ...rest,
      sort_order: idx,
    }));

  const hasUploading = items.some((it) => it.status === "uploading");

  const addLinkItem = useCallback(async (url, title, thumbnailUrl) => {
    const localId = `link_${Date.now()}_${Math.random()}`;
    setItems((prev) => [
      ...prev,
      {
        _localId: localId,
        type: "link",
        url,
        title: title || "",
        thumbnail_url: thumbnailUrl || "",
        sort_order: prev.length,
        status: "ready",
      },
    ]);
    return localId;
  }, []);

  return { items, addFiles, addLinkItem, removeItem, retryItem, readyMedia, hasUploading };
}