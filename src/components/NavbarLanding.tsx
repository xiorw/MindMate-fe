import { Component, createSignal } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";

const NavbarLanding: Component = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  // Helper function to check if a link is active
  const isActive = (path: string) => location.pathname === path;

  // Handle logo click to navigate to landing page or refresh if already on it
  const handleLogoClick = () => {
    if (location.pathname === "/") {
      window.location.reload();
    } else {
      navigate("/");
    }
  };

  // Toggle mobile menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen());
  };

  return (
    <nav class="bg-white/90 backdrop-blur-xl border-b border-rose-100/50 sticky top-0 z-50">
      <div class="max-w-screen-xl mx-auto p-4 relative flex items-center justify-between">
        {/* Logo and Brand */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleLogoClick();
          }}
          class="flex items-center space-x-3 z-10"
        >
          <div class="w-10 h-10 bg-rose-700 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-xl">M</span>
          </div>
          <span class="self-center text-2xl font-semibold whitespace-nowrap text-gray-800">
            MindMate
          </span>
        </a>

        {/* Navigation Menu Centered Absolutely - Hidden on Mobile */}
        <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:block">
          <ul class="font-medium flex space-x-8">
            <li>
              <a
                href="/mood-tracker"
                class={`block py-2 px-3 rounded md:p-0 font-semibold transition-colors ${
                  isActive('/mood-tracker')
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent'
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'
                }`}
              >
                Mood Tracker
              </a>
            </li>
            <li>
              <a
                href="/daily-journal"
                class={`block py-2 px-3 rounded md:p-0 font-semibold transition-colors ${
                  isActive('/daily-journal')
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent'
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'
                }`}
              >
                Daily Journal
              </a>
            </li>
            <li>
              <a
                href="/personal-stats"
                class={`block py-2 px-3 rounded md:p-0 font-semibold transition-colors ${
                  isActive('/personal-stats')
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent'
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'
                }`}
              >
                Personal Stats
              </a>
            </li>
            <li>
              <a
                href="/daily-motivation"
                class={`block py-2 px-3 rounded md:p-0 font-semibold transition-colors ${
                  isActive('/activity-suggestions')
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent'
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'
                }`}
              >
                Daily Motivation
              </a>
            </li>
          </ul>
        </div>

        {/* Right side - Hamburger Menu */}
        <div class="flex items-center space-x-4 z-10">
          {/* Hamburger Menu Button - Visible on Mobile */}
          <button
            type="button"
            class="md:hidden inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-controls="navbar-default"
            aria-expanded={isMenuOpen()}
            onClick={toggleMenu}
          >
            <span class="sr-only">Open main menu</span>
            <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 1h15M1 7h15M1 13h15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Toggleable */}
      <div
        class={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen() ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        id="navbar-default"
      >
        <div class="border-t border-rose-100/50">
          <ul class="font-medium flex flex-col p-4 space-y-2">
            <li>
              <a
                href="/mood-tracker"
                class={`block py-3 px-4 rounded-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md ${
                  isActive('/mood-tracker')
                    ? 'text-white bg-rose-800'
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Mood Tracker
              </a>
            </li>
            <li>
              <a
                href="/daily-journal"
                class={`block py-3 px-4 rounded-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md ${
                  isActive('/daily-journal')
                    ? 'text-white bg-rose-800'
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Daily Journal
              </a>
            </li>
            <li>
              <a
                href="/personal-stats"
                class={`block py-3 px-4 rounded-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md ${
                  isActive('/personal-stats')
                    ? 'text-white bg-rose-800'
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Personal Stats
              </a>
            </li>
            <li>
              <a
                href="/daily-motivation"
                class={`block py-3 px-4 rounded-lg font-semibold transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-md ${
                  isActive('/activity-suggestions')
                    ? 'text-white bg-rose-800'
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Daily Motivation
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavbarLanding;