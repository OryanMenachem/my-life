/**
 * Reusable circular avatar component.
 * - Shows uploaded image if avatar_url is a URL.
 * - Shows a built-in default if avatar_url matches "default-N".
 * - Falls back to initials on a colored circle if empty.
 */
export default function Avatar({ avatarUrl, userName, size = 36, className = "" }) {
  const dims = { width: size, height: size };

  // Uploaded image
  if (avatarUrl && !avatarUrl.startsWith("default-")) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className={`rounded-full object-cover flex-shrink-0 ${className}`}
        style={dims}
      />
    );
  }

  // Built-in default
  if (avatarUrl && avatarUrl.startsWith("default-")) {
    return <DefaultAvatarSwatch idx={avatarUrl} size={size} className={className} />;
  }

  // Fallback: initials
  const initials = getInitials(userName);
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 font-body font-semibold text-white select-none ${className}`}
      style={{ ...dims, backgroundColor: initialsColor(userName), fontSize: size * 0.38 }}
    >
      {initials}
    </div>
  );
}

/* ── Built-in default avatar swatches ── */
const DEFAULTS = {
  "default-1": { bg: "#e8d5b7", inner: "#c79a4f" },
  "default-2": { bg: "#b8d4e3", inner: "#4a7c96" },
  "default-3": { bg: "#c5d5c0", inner: "#5c7a52" },
  "default-4": { bg: "#e8d0d8", inner: "#b06b84" },
  "default-5": { bg: "#d4cde0", inner: "#6b5b8a" },
  "default-6": { bg: "#c0d5c8", inner: "#4a7a5c" },
  "default-7": { bg: "#e0d5c0", inner: "#8a7a5a" },
  "default-8": { bg: "#d8d8d8", inner: "#6a6a6a" },
};

function DefaultAvatarSwatch({ idx, size, className }) {
  const cfg = DEFAULTS[idx] || DEFAULTS["default-1"];
  return (
    <div
      className={`rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{ width: size, height: size, backgroundColor: cfg.bg }}
    >
      <svg viewBox="0 0 40 40" width={size * 0.55} height={size * 0.55}>
        <circle cx="20" cy="15" r="10" fill={cfg.inner} opacity="0.7" />
        <ellipse cx="20" cy="35" rx="16" ry="10" fill={cfg.inner} opacity="0.5" />
      </svg>
    </div>
  );
}

/* ── Helpers ── */
function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase();
}

const INITIAL_COLORS = [
  "#c79a4f", "#4a7c96", "#5c7a52", "#b06b84", "#6b5b8a",
  "#4a7a5c", "#8a7a5a", "#a0523b", "#5a6b8a",
];

function initialsColor(name) {
  if (!name) return INITIAL_COLORS[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return INITIAL_COLORS[Math.abs(hash) % INITIAL_COLORS.length];
}

/* Exported for use in Settings picker */
export { DEFAULTS };