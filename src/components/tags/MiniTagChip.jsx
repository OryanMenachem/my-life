// Category-specific warm palette from spec
const CAT_STYLES = {
  mood:     { bg: "#f6ecd9", fg: "#946a2b", bd: "#dcc59c" },
  life:     { bg: "#efe7dc", fg: "#876848", bd: "#d9c4a6" },
  location: { bg: "#ebe9d7", fg: "#71703e", bd: "#cdc69a" },
  general:  { bg: "#f1efeb", fg: "#6e685f", bd: "#cfc8ba" },
};

export default function MiniTagChip({ tag, category }) {
  const key = category?.system_key ?? "general";
  const style = CAT_STYLES[key] ?? CAT_STYLES.general;
  return (
    <span
      className="inline-flex items-center gap-1 px-[9px] rounded-full text-[10px] font-body font-medium border border-dashed whitespace-nowrap"
      style={{
        height: "22px",
        backgroundColor: style.bg,
        borderColor: style.bd,
        color: style.fg,
      }}
    >
      {tag.name_en}
    </span>
  );
}