import { Component, JSX } from "solid-js";
import { useLocation } from "@solidjs/router";
import Navbar from "./components/Navbar";
import NavbarLanding from "./components/NavbarLanding";
import Footer from "./components/Footer";

interface AppProps {
  children: JSX.Element;
}

const App: Component<AppProps> = (props) => {
  const location = useLocation();

  // Define routes for each navbar
  const landingNavbarRoutes = [
    "/",
    "/mood-tracker",
    "/daily-journal",
    "/personal-stats",
    "/activity-suggestions",
    "/help",
    "/contact-psychologist",
    "/community",
    "/privacy",
  ];
  const mainNavbarRoutes = [
    "/dashboard",
    "/mood",
    "/journal",
    "/calendar",
    "/statistics",
    "/profile",
    "/profile/edit",
    "/profile/change-password",
  ];
  // Define routes where Footer should not appear
  const noFooterRoutes = ["/login", "/register", "/forgot-password"];

  // Check which navbar to render based on the current path
  const showLandingNavbar = () => landingNavbarRoutes.includes(location.pathname);
  const showMainNavbar = () => mainNavbarRoutes.includes(location.pathname);
  // Check if Footer should be rendered
  const showFooter = () => !noFooterRoutes.includes(location.pathname);

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-100 to-white flex flex-col">
      {showLandingNavbar() && <NavbarLanding />}
      {showMainNavbar() && <Navbar />}
      <main class="flex-grow">{props.children}</main>
      {showFooter() && <Footer />}
    </div>
  );
};

export default App;