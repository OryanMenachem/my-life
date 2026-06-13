import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import BottomTabBar from "./BottomTabBar";
import Avatar from "./Avatar";

export default function AppLayout() {
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setAvatarUrl(u?.avatar_url || null);
      setUserName(u?.full_name || "");
    }).catch(() => {});
  }, []);

  // Listen for avatar updates from Settings
  useEffect(() => {
    window.__refreshAvatar = () => {
      base44.auth.me().then((u) => {
        setAvatarUrl(u?.avatar_url || null);
        setUserName(u?.full_name || "");
      }).catch(() => {});
    };
    return () => { delete window.__refreshAvatar; };
  }, []);

  return (
    <>
      {/* Avatar — top-left corner */}
      <button
        onClick={() => navigate("/settings")}
        className="fixed top-[10px] left-4 z-20 rounded-full hover:opacity-85 transition-opacity active:scale-95"
        aria-label="Open profile"
        style={{ width: 34, height: 34 }}
      >
        <Avatar avatarUrl={avatarUrl} userName={userName} size={34} />
      </button>

      <div className="pb-16">
        <Outlet />
      </div>
      <BottomTabBar />
    </>
  );
}