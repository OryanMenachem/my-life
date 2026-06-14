import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, ImagePlus, X, Check } from "lucide-react";
import exifr from "exifr";
import { format } from "date-fns";

/**
 * Full-screen import flow:
 * 1. Pick photos from device gallery
 * 2. Read EXIF capture date + upload each
 * 3. Group by day → create one entry per day with carousel
 */
export default function ImportFromGallery({ onClose, onComplete }) {
  const [step, setStep] = useState("pick"); // pick | importing | done
  const [photos, setPhotos] = useState([]);
  const [progress, setProgress] = useState({ current: 0, total: 0, stage: "" });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFilesSelected = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    // Only images
    const images = files.filter((f) => f.type.startsWith("image/"));
    if (!images.length) {
      setError("Please select image files.");
      return;
    }

    setError("");
    setStep("importing");
    setProgress({ current: 0, total: images.length, stage: "Reading photo dates…" });

    // Step 1: Read EXIF dates from all photos
    const withDates = [];
    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      setProgress({ current: i + 1, total: images.length, stage: `Reading photo ${i + 1} of ${images.length}…` });

      let captureDate = null;
      try {
        const exif = await exifr.parse(file, ["DateTimeOriginal"]);
        if (exif?.DateTimeOriginal) {
          captureDate = new Date(exif.DateTimeOriginal);
        }
      } catch {
        // EXIF parse failed
      }

      if (!captureDate) {
        captureDate = new Date(file.lastModified);
      }

      withDates.push({ file, captureDate });
    }

    // Step 2: Group by day key (yyyy-MM-dd)
    const groups = {};
    for (const item of withDates) {
      const key = format(item.captureDate, "yyyy-MM-dd");
      if (!groups[key]) {
        groups[key] = { date: item.captureDate, items: [] };
      }
      groups[key].items.push(item);
    }

    const dayKeys = Object.keys(groups).sort(); // oldest first
    const totalDays = dayKeys.length;

    // Step 3: Upload photos + create entries per day
    let imported = 0;
    let skipped = 0;

    for (let d = 0; d < dayKeys.length; d++) {
      const key = dayKeys[d];
      const group = groups[key];
      const sorted = group.items.sort((a, b) => a.captureDate - b.captureDate);

      setProgress({
        current: d + 1,
        total: totalDays,
        stage: `Creating entry for ${format(group.date, "d MMM yyyy")}…`,
      });

      // Upload all photos for this day
      const mediaItems = [];
      for (let j = 0; j < sorted.length; j++) {
        const { file } = sorted[j];
        try {
          const { file_url } = await base44.integrations.Core.UploadFile({ file });
          mediaItems.push({
            type: "photo",
            url: file_url,
            sort_order: j,
            width: 0,
            height: 0,
          });
        } catch {
          // Skip failed uploads
        }
      }

      if (mediaItems.length === 0) {
        skipped++;
        continue;
      }

      // Set entry_date to the day (midday)
      const entryDate = new Date(group.date);
      entryDate.setHours(12, 0, 0, 0);

      try {
        await base44.entities.Entry.create({
          content: "",
          source: "text",
          entry_date: entryDate.toISOString(),
          media: mediaItems,
          is_imported: true,
          imported_at: new Date().toISOString(),
        });
        imported++;
      } catch {
        skipped++;
      }
    }

    setResult({ imported, skipped, totalPhotos: withDates.length, totalDays });
    setStep("done");
  };

  const handleDone = () => {
    onComplete?.();
    onClose();
  };

  // ── Pick screen ──
  if (step === "pick") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 flex-shrink-0">
          <button onClick={onClose} className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors">
            Cancel
          </button>
          <span className="text-sm font-body font-semibold text-foreground">Import photos</span>
          <div className="w-12" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-6">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            <ImagePlus className="w-9 h-9 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-heading text-[19px] font-semibold text-foreground mb-2">
              Import from gallery
            </h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-[260px]">
              Select photos from your device. They'll be grouped by date and appear in your journal as new entries.
            </p>
          </div>

          {error && (
            <p className="text-sm font-body text-destructive">{error}</p>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-8 py-3 rounded-full bg-foreground text-background text-sm font-body font-semibold active:scale-95 transition-transform"
          >
            Choose photos
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFilesSelected}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // ── Importing screen ──
  if (step === "importing") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
          <Loader2 className="w-10 h-10 text-muted-foreground animate-spin" />
          <div>
            <p className="font-heading text-[17px] font-semibold text-foreground mb-1">
              Importing…
            </p>
            <p className="font-body text-sm text-muted-foreground">
              {progress.stage}
            </p>
          </div>
          {progress.total > 0 && (
            <div className="w-full max-w-[240px] h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.round((progress.current / progress.total) * 100)}%`,
                  backgroundColor: "hsl(var(--primary))",
                }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Done screen ──
  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
        <div className="w-20 h-20 rounded-full" style={{ backgroundColor: "#d4edda" }}>
          <div className="w-full h-full flex items-center justify-center">
            <Check className="w-9 h-9" style={{ color: "#2d6a4f" }} />
          </div>
        </div>
        <div>
          <h2 className="font-heading text-[19px] font-semibold text-foreground mb-2">
            Import complete
          </h2>
          <p className="font-body text-sm text-muted-foreground leading-relaxed">
            {result?.imported} {result?.imported === 1 ? "entry" : "entries"} created from {result?.totalPhotos} photos across {result?.totalDays} {result?.totalDays === 1 ? "day" : "days"}.
          </p>
          {result?.skipped > 0 && (
            <p className="font-body text-xs text-muted-foreground mt-1">
              {result.skipped} {result.skipped === 1 ? "entry" : "entries"} skipped.
            </p>
          )}
        </div>

        <button
          onClick={handleDone}
          className="px-8 py-3 rounded-full bg-foreground text-background text-sm font-body font-semibold active:scale-95 transition-transform mt-2"
        >
          Done
        </button>
      </div>
    </div>
  );
}