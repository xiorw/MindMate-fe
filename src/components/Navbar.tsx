import { Component, createSignal } from "solid-js";
import { useLocation, useNavigate } from "@solidjs/router";
import { userStore } from "./userStore";

const Navbar: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = createSignal(false);

  // Helper function to check if a link is active
  const isActive = (path: string) => location.pathname === path;

  // Compute initials for fallback avatar
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 0 || !name.trim()) return "U";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  // Handle logo click to refresh the current page
  const handleLogoClick = () => {
    window.location.reload();
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
          href="#"
          onClick={(e) => {
            e.preventDefault();
            handleLogoClick();
          }}
          class="flex items-center space-x-3 z-10"
        >
          <div class="w-10 h-10 bg-rose-700 rounded-xl flex items-center justify-center">
            <span class="text-white font-bold text-xl">M</span>
          </div>
          <span class="self-center text-2xl font-semibold whitespace-nowrap text-gray-800">MindMate</span>
        </a>

        {/* Navigation Menu Centered Absolutely - Hidden on Mobile */}
        <div class="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 hidden md:block">
          <ul class="font-medium flex space-x-8">
            <li>
              <a 
                href="/dashboard" 
                class={`block py-2 px-3 rounded md:p-0 font-semibold transition-colors
                  ${isActive('/dashboard') 
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'}`}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="/mood" 
                class={`block py-2 px-3 rounded md:p-0 transition-colors
                  ${isActive('/mood') 
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'}`}
              >
                Mood
              </a>
            </li>
            <li>
              <a 
                href="/journal" 
                class={`block py-2 px-3 rounded md:p-0 transition-colors
                  ${isActive('/journal') 
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'}`}
              >
                Journal
              </a>
            </li>
            <li>
              <a 
                href="/calendar" 
                class={`block py-2 px-3 rounded md:p-0 transition-colors
                  ${isActive('/calendar') 
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'}`}
              >
                Calendar
              </a>
            </li>
            <li>
              <a 
                href="/statistics" 
                class={`block py-2 px-3 rounded md:p-0 transition-colors
                  ${isActive('/statistics') 
                    ? 'text-rose-800 bg-rose-100/50 md:bg-transparent' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 md:hover:bg-transparent'}`}
              >
                Statistics
              </a>
            </li>
          </ul>
        </div>

        {/* Right side - User Profile and Hamburger Menu */}
        <div class="flex items-center space-x-4 z-10">
          {/* User Profile - Hidden on Mobile */}
          <div class="hidden md:flex items-center">
            <button
              type="button"
              class="flex text-sm rounded-full focus:ring-4 focus:ring-gray-800/30"
              id="user-menu-button"
              aria-expanded="false"
              onClick={() => navigate('/profile')}
            >
              <span class="sr-only">Open user menu</span>
              {userStore.user.avatar ? (
                <img
                  src={userStore.user.avatar}
                  alt="User Avatar"
                  class="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div class="w-10 h-10 bg-gradient-to-r from-rose-700 to-rose-800 rounded-full flex items-center justify-center">
                  <span class="text-white font-semibold text-sm">
                    {getInitials(userStore.user.name)}
                  </span>
                </div>
              )}
            </button>
          </div>

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
                href="/dashboard" 
                class={`block py-3 px-4 rounded-lg font-semibold transition-colors
                  ${isActive('/dashboard') 
                    ? 'text-white bg-rose-800' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </a>
            </li>
            <li>
              <a 
                href="/mood" 
                class={`block py-3 px-4 rounded-lg transition-colors
                  ${isActive('/mood') 
                    ? 'text-white bg-rose-800' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Mood
              </a>
            </li>
            <li>
              <a 
                href="/journal" 
                class={`block py-3 px-4 rounded-lg transition-colors
                  ${isActive('/journal') 
                    ? 'text-white bg-rose-800' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Journal
              </a>
            </li>
            <li>
              <a 
                href="/calendar" 
                class={`block py-3 px-4 rounded-lg transition-colors
                  ${isActive('/calendar') 
                    ? 'text-white bg-rose-800' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Calendar
              </a>
            </li>
            <li>
              <a 
                href="/statistics" 
                class={`block py-3 px-4 rounded-lg transition-colors
                  ${isActive('/statistics') 
                    ? 'text-white bg-rose-800' 
                    : 'text-gray-800 hover:text-rose-800 hover:bg-rose-100/50'}`}
                onClick={() => setIsMenuOpen(false)}
              >
                Statistics
              </a>
            </li>
            
            {/* User Profile in Mobile Menu */}
            <li class="pt-4 border-t border-rose-100/50">
              <button
                type="button"
                class="w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-gray-800 hover:text-rose-800 hover:bg-rose-100/50 transition-colors"
                onClick={() => {
                  navigate('/profile');
                  setIsMenuOpen(false);
                }}
              >
                {userStore.user.avatar ? (
                  <img
                    src={userStore.user.avatar}
                    alt="User Avatar"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div class="w-8 h-8 bg-gradient-to-r from-rose-700 to-rose-800 rounded-full flex items-center justify-center">
                    <span class="text-white font-semibold text-xs">
                      {getInitials(userStore.user.name)}
                    </span>
                  </div>
                )}
                <span class="font-semibold">Profile</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;