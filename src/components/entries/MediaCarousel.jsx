import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { formatDuration } from "@/utils/mediaUtils";
import ProgressiveImage from "./ProgressiveImage";

/**
 * Swipeable media carousel.
 * - 1 item: rendered plainly (no dots, no arrows).
 * - 2+ items: carousel with dots, arrows, and counter.
 * - Swipe always moves exactly one slide with fluid 1:1 finger tracking.
 */
export default function MediaCarousel({ media, flush = false }) {
  const visual = (media || []).filter((m) => m.type !== "link");
  if (visual.length === 0) return null;

  const slides = [...visual].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  if (slides.length === 1) {
    return <SingleMedia item={slides[0]} flush={flush} />;
  }

  return <MultiMedia slides={slides} flush={flush} />;
}

/* ── Single media (no carousel) ── */
function SingleMedia({ item, flush }) {
  const isVideo = item.type === "video";
  const src = item.thumbnail_url || item.url;
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={`relative w-full overflow-hidden bg-muted ${flush ? "" : "rounded-2xl"}`}
      style={{ aspectRatio: "4/3" }}
    >
      {/* Photo or video poster */}
      {!playing && src && (
        <ProgressiveImage
          src={src}
          placeholderSrc={item.thumbnail_url || undefined}
          alt=""
          priority
          containerClassName="absolute inset-0"
        />
      )}

      {/* Video playing state */}
      {isVideo && playing && (
        <video
          src={item.url}
          poster={item.thumbnail_url}
          controls
          playsInline
          autoPlay
          className="absolute inset-0 w-full h-full object-cover bg-black"
        />
      )}

      {/* Video play overlay */}
      {isVideo && !playing && (
        <button
          onClick={() => setPlaying(true)}
          className="absolute inset-0 flex items-center justify-center bg-black/20"
          aria-label="Play video"
        >
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          {item.duration_seconds > 0 && (
            <span className="absolute bottom-2 right-2 text-[11px] font-body font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded">
              {formatDuration(item.duration_seconds)}
            </span>
          )}
        </button>
      )}

      {!isVideo && src && (
        <ProgressiveImage
          src={src}
          placeholderSrc={item.thumbnail_url || undefined}
          alt=""
          priority
          containerClassName="absolute inset-0"
        />
      )}
    </div>
  );
}

/* ── Multi-media carousel ── */
function MultiMedia({ slides, flush }) {
  const [active, setActive] = useState(0);
  const [playingVideoIdx, setPlayingVideoIdx] = useState(null);
  const scrollRef = useRef(null);
  const videoRefs = useRef({});
  const touchStartX = useRef(0);
  const touchStartScroll = useRef(0);
  const isSwiping = useRef(false);
  const animFrame = useRef(null);

  const total = slides.length;
  const isAtStart = active === 0;
  const isAtEnd = active === total - 1;

  const clampIndex = (idx) => Math.max(0, Math.min(total - 1, idx));

  /* Animate to target slide with eased scrolling */
  const snapTo = useCallback((el, idx) => {
    const target = clampIndex(idx);
    el.style.scrollBehavior = "smooth";
    el.scrollTo({ left: target * el.clientWidth, behavior: "smooth" });
    // Reset to auto after the smooth animation ends so future programmatic
    // scrolls don't animate unexpectedly
    setTimeout(() => { el.style.scrollBehavior = "auto"; }, 400);
  }, []);

  /* Detect active from scroll position */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || isSwiping.current) return;
    const w = el.clientWidth;
    if (w === 0) return;
    const raw = el.scrollLeft / w;
    const idx = clampIndex(Math.round(raw));
    if (idx !== active) {
      setActive(idx);
    }
  }, [active, clampIndex]);

  /* ── Touch: 1:1 finger tracking ── */
  const handleTouchStart = useCallback((e) => {
    const el = scrollRef.current;
    if (!el) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartScroll.current = el.scrollLeft;
    isSwiping.current = true;
    // Kill any in-progress smooth scroll so finger tracking is instant
    el.style.scrollBehavior = "auto";
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!isSwiping.current) return;
    const el = scrollRef.current;
    if (!el) return;
    const deltaX = touchStartX.current - e.touches[0].clientX;
    animFrame.current = requestAnimationFrame(() => {
      el.scrollLeft = touchStartScroll.current + deltaX;
    });
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    if (animFrame.current) cancelAnimationFrame(animFrame.current);
    const el = scrollRef.current;
    if (!el) return;

    const deltaX = touchStartX.current - e.changedTouches[0].clientX;
    const w = el.clientWidth;
    const threshold = w * 0.2; // 20% of slide width

    if (Math.abs(deltaX) < threshold) {
      // Snap back to current slide
      snapTo(el, active);
      return;
    }

    // Advance exactly one slide
    const step = deltaX > 0 ? 1 : -1;
    const next = clampIndex(active + step);
    setActive(next);
    snapTo(el, next);
  }, [active, clampIndex, snapTo]);

  /* Pause video when swiping away */
  useEffect(() => {
    if (playingVideoIdx !== null && playingVideoIdx !== active) {
      const videoEl = videoRefs.current[playingVideoIdx];
      if (videoEl) videoEl.pause();
      setPlayingVideoIdx(null);
    }
  }, [active, playingVideoIdx]);

  /* Keyboard navigation */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const next = clampIndex(active - 1);
        setActive(next);
        snapTo(el, next);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        const next = clampIndex(active + 1);
        setActive(next);
        snapTo(el, next);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, [active, clampIndex, snapTo]);

  const goTo = (idx) => {
    const next = clampIndex(idx);
    setActive(next);
    snapTo(scrollRef.current, next);
  };

  return (
    <div className="w-full">
      {/* ── Carousel container ── */}
      <div className="relative group/carousel">
        {/* Scroll container */}
        <div
          ref={scrollRef}
          className={`flex overflow-x-hidden scrollbar-none w-full ${flush ? "" : "rounded-2xl"}`}
          style={{
            aspectRatio: "4/3",
            touchAction: "pan-y",
            scrollBehavior: "auto",
          }}
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          tabIndex={0}
          role="region"
          aria-label={`Image carousel, ${total} slides`}
        >
          {slides.map((item, idx) => {
            const isVideo = item.type === "video";
            const isPlaying = playingVideoIdx === idx;
            const src = item.thumbnail_url || item.url;

            return (
              <div
                key={idx}
                className="flex-shrink-0 w-full relative bg-muted"
                style={{ aspectRatio: "4/3" }}
              >
                {/* Photo or video poster */}
                {!isPlaying && src && (
                  <ProgressiveImage
                    src={src}
                    placeholderSrc={item.thumbnail_url || undefined}
                    alt=""
                    priority={idx === 0}
                    containerClassName="absolute inset-0"
                  />
                )}

                {/* Video that auto-plays */}
                {isVideo && isPlaying && (
                  <video
                    ref={(el) => { if (el) videoRefs.current[idx] = el; }}
                    src={item.url}
                    controls
                    playsInline
                    autoPlay
                    className="absolute inset-0 w-full h-full object-cover bg-black"
                  />
                )}

                {/* Video play overlay */}
                {isVideo && !isPlaying && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPlayingVideoIdx(idx);
                    }}
                    className="absolute inset-0 flex items-center justify-center bg-black/20"
                    aria-label="Play video"
                  >
                    <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                    {item.duration_seconds > 0 && (
                      <span className="absolute bottom-2 right-2 text-[11px] font-body font-semibold text-white bg-black/50 px-1.5 py-0.5 rounded">
                        {formatDuration(item.duration_seconds)}
                      </span>
                    )}
                  </button>
                )}

                {/* Counter badge */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-[11px] font-body font-semibold px-2 py-0.5 rounded-full">
                  {idx + 1}/{total}
                </div>
              </div>
            );
          })}
        </div>

        {/* Left arrow */}
        {!isAtStart && (
          <button
            onClick={() => goTo(active - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity active:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {/* Right arrow */}
        {!isAtEnd && (
          <button
            onClick={() => goTo(active + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity active:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Pagination dots ── */}
      <div className="flex items-center justify-center gap-[5px] mt-2 px-4">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className="rounded-full transition-all duration-200"
            style={{
              width: idx === active ? 7 : 5,
              height: idx === active ? 7 : 5,
              backgroundColor: idx === active ? "hsl(var(--accent-foreground))" : "hsl(var(--muted-foreground) / 0.35)",
            }}
            aria-label={`Go to image ${idx + 1}`}
            aria-current={idx === active ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}