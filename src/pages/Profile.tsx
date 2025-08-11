import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

const API_URL = "http://127.0.0.1:8080/api/user/profile"; 

const Profile: Component = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = createSignal(false);
  const [user, setUser] = createSignal<{ 
    id?: number;
    username: string; 
    email: string; 
    age?: number | null; 
    gender?: string | null; 
    avatar?: string | null;
    created_at?: string;
    updated_at?: string;
  } | null>(null);
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);

  // Generate default avatar with initials
  const generateDefaultAvatar = (name: string) => {
    const getInitials = (fullName: string) => {
      const words = fullName.trim().split(/\s+/);
      if (words.length === 0 || !fullName.trim()) return "U";
      if (words.length === 1) return words[0].charAt(0).toUpperCase();
      return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
    };

    const initial = getInitials(name);
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="150" height="150" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#be123c;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#9f1239;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="75" cy="75" r="75" fill="url(#grad)"/>
        <text x="75" y="95" font-family="Arial, sans-serif" font-size="50" font-weight="bold" fill="white" text-anchor="middle">${initial}</text>
      </svg>
    `)}`;
  };

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
    fetchUserProfile();
  });

  const fetchUserProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please login first");
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Reduced timeout for better UX
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 8000); // 8 second timeout

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate('/login');
          return;
        }
        
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Profile data received:", data); // Debug log
      
      // Ensure data structure matches database schema
      const userData = {
        id: data.id,
        username: data.username || "",
        email: data.email || "",
        age: data.age || null,
        gender: data.gender || null,
        avatar: data.avatar || null,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setUser(userData);
      setLoading(false);
      
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      
      if (err.name === 'AbortError') {
        setError("Request timeout. Please check your connection and try again.");
      } else if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(`Failed to load profile: ${err.message}`);
      }
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate('/login');
  };

  const handleRefresh = () => {
    fetchUserProfile();
  };

  const getDisplayAvatar = () => {
    const userData = user();
    if (!userData) return null;
    
    // Check if avatar exists and is not empty
    if (userData.avatar && userData.avatar.trim()) {
      return userData.avatar;
    } else {
      return generateDefaultAvatar(userData.username);
    }
  };

  const formatAge = (age?: number | null) => {
    if (!age || age <= 0) return "Not specified";
    return `${age} years old`;
  };

  const formatGender = (gender?: string | null) => {
    if (!gender || !gender.trim()) return "Not specified";
    return gender;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not available";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "Not available";
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl md:text-4xl font-bold text-rose-700">Profile</h1>
          </div>
          
          <div class="max-w-full p-6 bg-white/80 border border-rose-200 rounded-2xl shadow-xl backdrop-blur-md">
            
            {loading() && (
              <div class="flex items-center justify-center py-12">
                <div class="flex flex-col items-center space-y-4">
                  <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-700"></div>
                  <div class="text-gray-600 text-lg">Loading profile...</div>
                </div>
              </div>
            )}
            
            {error() && (
              <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 shadow-sm" role="alert">
                <svg class="flex-shrink-0 inline w-4 h-4 me-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5zM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2z"/>
                </svg>
                <span class="font-medium">{error()}</span>
                <button
                  onClick={handleRefresh}
                  class="ml-auto text-red-600 hover:text-red-800 underline"
                >
                  Retry
                </button>
              </div>
            )}
            
            {user() && !loading() && (
              <div class="space-y-6">
                {/* Avatar Section */}
                <div class="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
                  <div class="flex-shrink-0">
                    <img 
                      src={getDisplayAvatar()!} 
                      alt="User Avatar" 
                      class="w-28 h-28 rounded-full object-cover border-4 border-rose-200 shadow-lg"
                      onError={(e) => {
                        // Fallback if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.src = generateDefaultAvatar(user()!.username);
                      }}
                    />
                  </div>
                  <div class="flex-1 text-center sm:text-left">
                    <h6 class="text-2xl font-bold text-gray-800 mb-2">{user()!.username}</h6>
                    <p class="text-lg text-gray-600 mb-1 break-all">{user()!.email}</p>
                    <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0 text-sm text-gray-500">
                      <span class="flex items-center justify-center sm:justify-start">
                        <svg class="w-5 h-5 mr-1 mt-1" fill="white" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                          {/* Candles */}
                          <rect x="8" y="2" width="1" height="4" fill="currentColor" stroke="none"/>
                          <rect x="12" y="1" width="1" height="5" fill="currentColor" stroke="none"/>
                          <rect x="16" y="2" width="1" height="4" fill="currentColor" stroke="none"/>
                          {/* Flames */}
                          <ellipse cx="8.5" cy="1.5" rx="0.5" ry="1" fill="currentColor" stroke="none"/>
                          <ellipse cx="12.5" cy="0.5" rx="0.5" ry="1" fill="currentColor" stroke="none"/>
                          <ellipse cx="16.5" cy="1.5" rx="0.5" ry="1" fill="currentColor" stroke="none"/>
                          {/* Cake base */}
                          <rect x="6" y="6" width="12" height="10" rx="1" ry="1" fill="white" stroke="currentColor" stroke-width="1.5"/>
                          {/* Cake layers/decorations */}
                          <line x1="6" y1="9" x2="18" y2="9" stroke="currentColor" stroke-width="1"/>
                          <line x1="6" y1="12" x2="18" y2="12" stroke="currentColor" stroke-width="1"/>
                          {/* Base plate */}
                          <rect x="4" y="16" width="16" height="2" rx="1" ry="1" fill="white" stroke="currentColor" stroke-width="1.5"/>
                        </svg>
                        {formatAge(user()!.age)}
                      </span>
                      <span class="flex items-center justify-center sm:justify-start">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                        </svg>
                        {formatGender(user()!.gender)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Details Cards */}
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <div class="bg-white/60 rounded-lg p-5 border border-rose-100 shadow-sm">
                    <h6 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg class="w-5 h-5 mr-2 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Personal Information
                    </h6>
                    <div class="space-y-3">
                      <div>
                        <label class="text-sm font-medium text-gray-600">Username</label>
                        <p class="text-gray-800 font-medium">{user()!.username}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-600">Age</label>
                        <p class="text-gray-800">{formatAge(user()!.age)}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-600">Gender</label>
                        <p class="text-gray-800">{formatGender(user()!.gender)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Account Information */}
                  <div class="bg-white/60 rounded-lg p-5 border border-rose-100 shadow-sm">
                    <h6 class="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg class="w-5 h-5 mr-2 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                      </svg>
                      Contact & Account
                    </h6>
                    <div class="space-y-3">
                      <div>
                        <label class="text-sm font-medium text-gray-600">Email Address</label>
                        <p class="text-gray-800 break-all font-medium">{user()!.email}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-600">Member Since</label>
                        <p class="text-gray-800">{formatDate(user()!.created_at)}</p>
                      </div>
                      <div>
                        <label class="text-sm font-medium text-gray-600">Last Updated</label>
                        <p class="text-gray-800">{formatDate(user()!.updated_at)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate('/profile/edit')}
                    class="flex-1 text-rose-700 border border-rose-700 hover:bg-rose-100 hover:scale-105 font-medium rounded-lg text-sm px-5 py-3 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => navigate('/profile/change-password')}
                    class="flex-1 text-rose-700 border border-rose-700 hover:bg-rose-100 hover:scale-105 font-medium rounded-lg text-sm px-5 py-3 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                    </svg>
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    class="flex-1 text-white bg-rose-700 hover:bg-rose-800 hover:scale-105 font-medium rounded-lg text-sm px-5 py-3 transition-all duration-200 flex items-center justify-center space-x-2"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;