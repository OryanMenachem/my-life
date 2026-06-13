import { Outlet } from "react-router-dom";
import BottomTabBar from "./BottomTabBar";

export default function AppLayout() {
  return (
    <>
      <div className="pb-16">
        <Outlet />
      </div>
      <BottomTabBar />
    </>
  );
}