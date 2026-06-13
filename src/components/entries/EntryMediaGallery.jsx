/**
 * Full media gallery shown in EntryDetail.
 * Photos: full-width image. Videos: native <video> player.
 */
export default function EntryMediaGallery({ media }) {
  if (!media || media.length === 0) return null;

  return (
    <div className="flex flex-col gap-3 mt-5">
      {media.map((item, idx) => {
        const isVideo = item.type === "video";
        const ratio = item.width && item.height
          ? item.width / item.height
          : 4 / 3;

        return (
          <div
            key={idx}
            className="relative w-full rounded-2xl overflow-hidden bg-muted"
            style={{ aspectRatio: ratio }}
          >
            {isVideo ? (
              <video
                src={item.url}
                controls
                playsInline
                className="absolute inset-0 w-full h-full object-contain bg-black"
              />
            ) : (
              item.url && (
                <img
                  src={item.url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
              )
            )}
          </div>
        );
      })}
    </div>
  );
}