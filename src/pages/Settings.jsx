import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import {
  User, LogOut, Palette, Globe, Download, Trash2, Lock,
  Info, Pencil, Check, X, Sparkles, Camera, Loader2
} from "lucide-react";
import { useTheme, THEMES } from "@/lib/ThemeContext";
import { useLang } from "@/lib/LanguageContext";
import { useAppLock } from "@/lib/AppLockContext";
import SettingsSection from "@/components/settings/SettingsSection";
import SettingsRow from "@/components/settings/SettingsRow";
import ThemePickerSheet from "@/components/ThemePickerSheet";
import AppLockSheet from "@/components/settings/AppLockSheet";
import DeleteAccountSheet from "@/components/settings/DeleteAccountSheet";
import Avatar, { DEFAULTS } from "@/components/Avatar";
import { Switch } from "@/components/ui/switch";

const APP_VERSION = "1.0.0";

const THEME_LIST = [
  { key: "cream", label: "Cream" }, { key: "sky", label: "Sky" },
  { key: "sage", label: "Sage" }, { key: "blossom", label: "Blossom" },
  { key: "lavender", label: "Lavender" }, { key: "mint", label: "Mint" },
  { key: "sand", label: "Sand" }, { key: "charcoal", label: "Charcoal" },
];

export default function Settings() {
  const { theme: currentTheme } = useTheme();
  const { lang, setLang } = useLang();
  const { lockEnabled } = useAppLock();

  const [me, setMe] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameVal, setNameVal] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [autoTagging, setAutoTagging] = useState(false);
  const [togglingAI, setTogglingAI] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);

  const [themeSheet, setThemeSheet] = useState(false);
  const [lockSheet, setLockSheet] = useState(false);
  const [deleteSheet, setDeleteSheet] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    base44.auth.me().then((u) => {
      setMe(u);
      setNameVal(u?.full_name || "");
      setAutoTagging(u?.auto_ai_tagging || false);
      setAvatarUrl(u?.avatar_url || null);
    }).catch(() => {});
  }, []);

  const toggleAutoTagging = async (checked) => {
    setAutoTagging(checked);
    setTogglingAI(true);
    try {
      await base44.auth.updateMe({ auto_ai_tagging: checked });
      setMe((prev) => ({ ...prev, auto_ai_tagging: checked }));
    } catch {
      setAutoTagging(!checked);
    }
    setTogglingAI(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");

    // Validate type
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setAvatarError("Please choose a JPG, PNG, or WebP image.");
      return;
    }

    setUploadingAvatar(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.updateMe({ avatar_url: file_url });
      setAvatarUrl(file_url);
      setMe((prev) => ({ ...prev, avatar_url: file_url }));
      if (window.__refreshHomeAvatar) window.__refreshHomeAvatar();
    } catch {
      setAvatarError("Upload failed — please try again.");
    }
    setUploadingAvatar(false);
    // Reset input so same file can be re-chosen
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const selectDefaultAvatar = async (key) => {
    setAvatarError("");
    try {
      await base44.auth.updateMe({ avatar_url: key });
      setAvatarUrl(key);
      setMe((prev) => ({ ...prev, avatar_url: key }));
      if (window.__refreshHomeAvatar) window.__refreshHomeAvatar();
    } catch {
      setAvatarError("Couldn't save avatar — please try again.");
    }
  };

  const saveName = async () => {
    if (!nameVal.trim()) return;
    setSavingName(true);
    try {
      const updated = await base44.auth.updateMe({ full_name: nameVal.trim() });
      setMe((prev) => ({ ...prev, full_name: nameVal.trim() }));
    } catch {}
    setSavingName(false);
    setEditingName(false);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const entries = await base44.entities.Entry.list("-created_date", 5000);
      const blob = new Blob(
        [JSON.stringify({ exported_at: new Date().toISOString(), entries }, null, 2)],
        { type: "application/json" }
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `mylife-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
    setExporting(false);
  };

  const themeLabel = THEME_LIST.find((t) => t.key === currentTheme)?.label || currentTheme;
  const langLabel = lang === "he" ? "Hebrew" : "English";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-3 text-center">
          <h1 className="font-heading text-[21px] font-semibold tracking-[-0.5px] text-foreground uppercase">
            SETTINGS
          </h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 py-5 pb-28">
        {/* ── My Profile ── */}
        <SettingsSection title="My Profile">
          {/* Large avatar + upload */}
          <div className="px-5 py-5 flex flex-col items-center gap-4">
            <div className="relative">
              {uploadingAvatar ? (
                <div className="w-[88px] h-[88px] rounded-full bg-muted flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                </div>
              ) : (
                <Avatar avatarUrl={avatarUrl} userName={me?.full_name} size={88} />
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-foreground text-background flex items-center justify-center shadow-md hover:opacity-90 transition-opacity active:scale-95"
                aria-label="Upload photo"
                disabled={uploadingAvatar}
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            {avatarError && (
              <p className="text-xs font-body text-destructive">{avatarError}</p>
            )}
          </div>

          {/* Default avatars */}
          <div className="px-5 pb-5">
            <p className="text-[11px] font-body font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
              Choose a default
            </p>
            <div className="flex flex-wrap gap-3">
              {Object.keys(DEFAULTS).map((key) => {
                const selected = avatarUrl === key;
                return (
                  <button
                    key={key}
                    onClick={() => selectDefaultAvatar(key)}
                    className={`rounded-full transition-all active:scale-95 ${
                      selected ? "" : "hover:opacity-80"
                    }`}
                    style={{
                      outline: selected ? "2px solid hsl(var(--accent-foreground))" : "none",
                      outlineOffset: "3px",
                    }}
                    aria-label={`Default avatar ${key.split("-")[1]}`}
                  >
                    <Avatar avatarUrl={key} userName="" size={48} />
                  </button>
                );
              })}
            </div>
          </div>
        </SettingsSection>

        {/* ── Account ── */}
        <SettingsSection title="Account">
          {/* Name row */}
          <div className="px-5 py-4 flex items-center gap-3">
            <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            {editingName ? (
              <div className="flex-1 flex items-center gap-2">
                <input
                  autoFocus
                  value={nameVal}
                  onChange={(e) => setNameVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                  className="flex-1 bg-transparent outline-none font-body text-sm text-foreground border-b border-border pb-0.5"
                />
                <button onClick={saveName} disabled={savingName} className="text-muted-foreground hover:text-foreground">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingName(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-between">
                <div>
                  <p className="font-body text-sm font-medium text-foreground">
                    {me?.full_name || "—"}
                  </p>
                  <p className="font-body text-xs text-muted-foreground">{me?.email}</p>
                </div>
                <button
                  onClick={() => setEditingName(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted/60 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>

          <SettingsRow
            icon={<LogOut className="w-4 h-4" />}
            label="Sign out"
            destructive
            onClick={() => base44.auth.logout()}
          />
        </SettingsSection>

        {/* ── Appearance ── */}
        <SettingsSection title="Appearance">
          <SettingsRow
            icon={<Palette className="w-4 h-4" />}
            label="Theme"
            value={themeLabel}
            onClick={() => setThemeSheet(true)}
          />
          <SettingsRow
            icon={<Globe className="w-4 h-4" />}
            label="Language"
            value={langLabel}
            rightEl={
              <div className="flex gap-1.5">
                {["en", "he"].map((l) => (
                  <button
                    key={l}
                    onClick={() => setLang(l)}
                    className="text-[11px] font-body font-semibold px-2.5 py-1 rounded-full border transition-all"
                    style={{
                      borderColor: lang === l ? "var(--theme-accent)" : "var(--border)",
                      backgroundColor: lang === l ? "var(--theme-accent)" : "transparent",
                      color: lang === l ? "#fff" : "var(--muted-foreground)",
                    }}
                  >
                    {l === "en" ? "EN" : "עב"}
                  </button>
                ))}
              </div>
            }
          />
        </SettingsSection>

        {/* ── AI ── */}
        <SettingsSection title="AI">
          <div className="px-5 py-4 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <div className="flex-1">
              <p className="font-body text-sm font-medium text-foreground">
                Automatic AI tagging
              </p>
              <p className="font-body text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Automatically tag new entries using your existing tags.
              </p>
            </div>
            <Switch
              checked={autoTagging}
              onCheckedChange={toggleAutoTagging}
              disabled={togglingAI}
            />
          </div>
        </SettingsSection>

        {/* ── Privacy & Data ── */}
        <SettingsSection title="Privacy & Data">
          <SettingsRow
            icon={<Download className="w-4 h-4" />}
            label={exporting ? "Exporting…" : "Export my data"}
            onClick={handleExport}
            disabled={exporting}
          />
          <SettingsRow
            icon={<Lock className="w-4 h-4" />}
            label="App lock (PIN)"
            value={lockEnabled ? "On" : "Off"}
            onClick={() => setLockSheet(true)}
          />
          <SettingsRow
            icon={<Trash2 className="w-4 h-4" />}
            label="Delete my account"
            destructive
            onClick={() => setDeleteSheet(true)}
          />
        </SettingsSection>

        {/* ── About ── */}
        <SettingsSection title="About">
          <SettingsRow
            icon={<Info className="w-4 h-4" />}
            label="My Life"
            value={`v${APP_VERSION}`}
          />
          <div className="px-5 py-3">
            <p className="font-body text-xs text-muted-foreground leading-relaxed">
              Your personal voice journal. Speak your life — capture a moment in seconds, find it forever.
            </p>
          </div>
        </SettingsSection>
      </main>

      {themeSheet && <ThemePickerSheet onClose={() => setThemeSheet(false)} />}
      {lockSheet && (
        <AppLockSheet
          currentlyEnabled={lockEnabled}
          onClose={() => setLockSheet(false)}
        />
      )}
      {deleteSheet && (
        <DeleteAccountSheet
          onClose={() => setDeleteSheet(false)}
        />
      )}
    </div>
  );
}