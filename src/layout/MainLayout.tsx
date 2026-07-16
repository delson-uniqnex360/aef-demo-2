import { Outlet } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import MegaMenu from "../components/MegaMenu";

const MainLayout = () => {
  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <AppHeader />
        <MegaMenu />
      </div>

      <main className="pt-28 p-4">
        <Outlet />
      </main>
    </>
  );
};

export default MainLayout;
