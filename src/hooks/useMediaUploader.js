import { useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { processPhotoForUpload, getVideoDuration, captureVideoThumbnail } from "@/utils/mediaUtils";

const MAX_VIDEO_SECONDS = 30;

/**
 * Manages a local media list with upload lifecycle per item.
 * Each item shape:
 *  { _localId, type, url, thumbnail_url, previewUrl, width, height,
 *    duration_seconds, sort_order, status: "uploading"|"ready"|"error", _file }
 *
 * initialMedia: array of already-saved media objects from an existing entry.
 */
export function useMediaUploader(initialMedia = []) {
  const [items, setItems] = useState(() =>
    initialMedia.map((m, idx) => ({ ...m, _localId: `saved_${idx}`, status: "ready" }))
  );

  const updateItem = useCallback((localId, patch) => {
    setItems((prev) =>
      prev.map((it) => (it._localId === localId ? { ...it, ...patch } : it))
    );
  }, []);

  const removeItem = useCallback((localId) => {
    setItems((prev) => prev.filter((it) => it._localId !== localId));
  }, []);

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

  const uploadFileItem = useCallback(async (localId, file, isVideo) => {
    try {
      let url, thumbnail_url = "", width = 0, height = 0, duration_seconds = 0;

      if (isVideo) {
        try { duration_seconds = await getVideoDuration(file); } catch { /* ok */ }
        const thumbBlob = await captureVideoThumbnail(file);
        if (thumbBlob) {
          const thumbFile = new File([thumbBlob], "thumb.jpg", { type: "image/jpeg" });
          const thumbRes = await base44.integrations.Core.UploadFile({ file: thumbFile });
          thumbnail_url = thumbRes.file_url;
        }
        const res = await base44.integrations.Core.UploadFile({ file });
        url = res.file_url;
      } else {
        // Photo: generate thumbnail + compressed display image
        const { thumbnailBlob, compressed } = await processPhotoForUpload(file);
        const [thumbRes, mainRes] = await Promise.all([
          base44.integrations.Core.UploadFile({ file: new File([thumbnailBlob], "thumb.jpg", { type: "image/jpeg" }) }),
          base44.integrations.Core.UploadFile({ file: new File([compressed.blob], file.name, { type: compressed.blob.type }) }),
        ]);
        thumbnail_url = thumbRes.file_url;
        url = mainRes.file_url;
        width = compressed.width;
        height = compressed.height;
      }

      updateItem(localId, { url, thumbnail_url, width, height, duration_seconds, status: "ready" });
    } catch {
      updateItem(localId, { status: "error" });
    }
  }, [updateItem]);

  const addFiles = useCallback(async (files) => {
    const errors = [];

    for (const file of files) {
      const isVideo = file.type.startsWith("video/");
      const isImage = file.type.startsWith("image/");
      if (!isVideo && !isImage) continue;

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
          _file: file, // keep reference for retry
        },
      ]);

      // Upload in background
      uploadFileItem(localId, file, isVideo);
    }

    return errors;
  }, [updateItem, validateFile, uploadFileItem]);

  const retryItem = useCallback(async (localId) => {
    const item = items.find((it) => it._localId === localId);
    const file = item?._file;
    if (!file) {
      // No file reference — can't retry, remove instead
      removeItem(localId);
      return;
    }
    const isVideo = file.type.startsWith("video/");
    updateItem(localId, { status: "uploading" });
    uploadFileItem(localId, file, isVideo);
  }, [items, updateItem, uploadFileItem, removeItem]);

  // Returns the media array ready to persist (only "ready" items, without local fields)
  const readyMedia = items
    .filter((it) => it.status === "ready")
    .map(({ _localId, previewUrl, status, _file, ...rest }, idx) => ({
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