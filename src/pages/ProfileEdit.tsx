import { Component, createSignal, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";

const API_URL = "https://mindmate-be-production.up.railway.app/api/user/profile";

const ProfileEdit: Component = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = createSignal(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = createSignal(false);
  const [username, setUsername] = createSignal("");
  const [email, setEmail] = createSignal("");
  const [age, setAge] = createSignal<number | null>(null);
  const [gender, setGender] = createSignal("");
  const [avatar, setAvatar] = createSignal<File | null>(null);
  const [avatarPreview, setAvatarPreview] = createSignal<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = createSignal<string | null>(null);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const [loading, setLoading] = createSignal(false);

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

  // Initialize with default avatar immediately
  const initializeDefaultData = () => {
    const defaultAvatar = generateDefaultAvatar("User");
    setAvatarPreview(defaultAvatar);
    setCurrentAvatarUrl("");
  };

  onMount(() => {
    console.log("ProfileEdit mounted");
    setTimeout(() => setIsVisible(true), 100);
    // Initialize default data first
    initializeDefaultData();
    // Then fetch user data
    fetchUserProfile();
  });

  const fetchUserProfile = async () => {
    console.log("Starting fetch...");
    const token = localStorage.getItem("token");
    
    if (!token) {
      console.log("No token, redirecting");
      setError("Please login first");
      navigate('/login');
      return;
    }

    try {
      console.log("Making API call...");
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        if (response.status === 401) {
          console.log("Unauthorized");
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          navigate('/login');
          return;
        }
        
        const errorText = await response.text().catch(() => "Unknown error");
        console.log("Error response:", errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log("Received data:", data);
      
      // Set form data
      setUsername(data.username || "");
      setEmail(data.email || "");
      setAge(data.age || null);
      setGender(data.gender || "");
      
      // Handle avatar
      if (data.avatar && data.avatar.trim() && data.avatar !== '') {
        console.log("Setting user avatar:", data.avatar);
        setCurrentAvatarUrl(data.avatar);
        setAvatarPreview(data.avatar);
      } else {
        console.log("Using default avatar");
        const defaultAvatar = generateDefaultAvatar(data.username || "User");
        setCurrentAvatarUrl("");
        setAvatarPreview(defaultAvatar);
      }
      
      console.log("Profile data loaded successfully");
      
    } catch (err: any) {
      console.error("Profile fetch error:", err);
      
      if (err.message.includes('NetworkError') || err.message.includes('Failed to fetch')) {
        setError("Network error. Please check your internet connection.");
      } else {
        setError(`Failed to load profile: ${err.message}`);
      }
    }
  };

  // Handle avatar file change
  const handleAvatarChange = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setAvatar(file);
      
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.onerror = () => {
        setError("Failed to read image file");
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  // Handle reset avatar
  const handleResetAvatar = () => {
    const defaultAvatar = generateDefaultAvatar(username());
    setAvatarPreview(defaultAvatar);
    setAvatar(null);
    setCurrentAvatarUrl("");
    
    const fileInput = document.getElementById('avatar') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Handle dropdown focus/blur for gender field
  const handleGenderDropdownFocus = () => {
    setIsGenderDropdownOpen(true);
  };

  const handleGenderDropdownBlur = () => {
    setTimeout(() => setIsGenderDropdownOpen(false), 150);
  };

  // Validate form
  const validateForm = (): string | null => {
    if (!username().trim()) return "Username is required";
    if (username().trim().length < 2) return "Username must be at least 2 characters";
    if (!email().trim()) return "Email is required";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email().trim())) return "Please enter a valid email";
    
    if (age() !== null && (age()! < 1 || age()! > 120)) {
      return "Age must be between 1 and 120";
    }
    
    return null;
  };

  // Handle update
  const handleUpdateProfile = async () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please login first");
        navigate('/login');
        return;
      }

      const headers: Record<string, string> = {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      const formData = {
        username: username().trim(),
        email: email().trim(),
        age: age(),
        gender: gender().trim() || null,
      };

      let jsonData: any = {
        ...formData,
      };

      // Handle avatar - always send as base64 string or empty string
      if (avatar()) {
        // Convert file to base64
        const base64Avatar = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(avatar()!);
        });
        jsonData.avatar = base64Avatar;
      } else if (avatarPreview()?.startsWith('data:image/svg+xml')) {
        // Using default avatar - send empty string to clear avatar field
        jsonData.avatar = "";
        jsonData.useDefaultAvatar = true;
      } else {
        // Keep existing avatar
        jsonData.avatar = currentAvatarUrl() || "";
      }

      console.log("Sending data:", { ...jsonData, avatar: jsonData.avatar ? "base64 data" : "empty" });

      const response = await fetch(API_URL, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(jsonData),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error");
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      
      setSuccess("Profile updated successfully!");
      
      // Update avatar preview based on server response
      if (result.avatar && result.avatar.trim() && result.avatar !== '') {
        // Server returned avatar URL or base64
        setCurrentAvatarUrl(result.avatar);
        setAvatarPreview(result.avatar);
      } else if (avatar()) {
        // We uploaded a new file but server didn't return it, keep our preview
        // This happens when server processes the base64 but doesn't return the URL immediately
        // Keep the current preview (base64) that we already set
        setCurrentAvatarUrl("");
      } else if (avatarPreview()?.startsWith('data:image/svg+xml')) {
        // We explicitly chose default avatar
        const defaultAvatar = generateDefaultAvatar(username());
        setCurrentAvatarUrl("");
        setAvatarPreview(defaultAvatar);
      }
      // If none of above conditions, keep current preview as is
      
      setAvatar(null);
      const fileInput = document.getElementById('avatar') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => {
        navigate('/profile');
      }, 1500);

    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <style>
        {`
          .dropdown-container {
            position: relative;
          }
          
          .dropdown-select {
            appearance: none;
            background-image: none;
            padding-right: 2.5rem;
            cursor: pointer;
          }
          
          .dropdown-arrow {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            width: 1.25rem;
            height: 1.25rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            pointer-events: none;
            color: #9ca3af;
          }
          
          .dropdown-container:hover .dropdown-arrow {
            color: #be123c;
          }
          
          .dropdown-arrow.open {
            color: #be123c;
            transform: translateY(-50%) rotate(180deg);
          }
          
          .dropdown-select:focus {
            color: #be123c;
            border-color: #be123c;
            outline: none;
          }
        `}
      </style>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl md:text-4xl font-bold text-rose-700">Edit Profile</h1>
          </div>

          {success() && (
            <div class="flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200 shadow-sm">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414z"/>
              </svg>
              <span class="font-medium">{success()}</span>
            </div>
          )}

          {error() && (
            <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 shadow-sm">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5zM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2z"/>
              </svg>
              <span class="font-medium">{error()}</span>
            </div>
          )}

          <div class="max-w-full p-6 bg-white/80 border border-rose-200 rounded-2xl shadow-xl backdrop-blur-md">
            <div class="space-y-6">
              {/* Avatar Section */}
              <div class="flex flex-col items-center space-y-4">
                <div class="relative">
                  {avatarPreview() && (
                    <img
                      src={avatarPreview()!}
                      alt="Avatar Preview"
                      class="w-28 h-28 rounded-full object-cover border-4 border-rose-200 shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = generateDefaultAvatar(username() || "User");
                      }}
                    />
                  )}
                  <label 
                    for="avatar" 
                    class="absolute bottom-0 right-0 bg-rose-600 text-white p-2 rounded-full cursor-pointer hover:bg-rose-700 transition-colors shadow-lg"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                  </label>
                </div>

                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  class="hidden"
                  onChange={handleAvatarChange}
                  disabled={loading()}
                />

                <div class="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => document.getElementById('avatar')?.click()}
                    class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-sm px-4 py-2 transition-colors disabled:opacity-50"
                    disabled={loading()}
                  >
                    Choose Photo
                  </button>
                  <button
                    type="button"
                    onClick={handleResetAvatar}
                    class="text-gray-700 border border-gray-300 hover:bg-gray-100 font-medium rounded-lg text-sm px-4 py-2 transition-colors disabled:opacity-50"
                    disabled={loading()}
                  >
                    Use Default
                  </button>
                </div>
              </div>

              {/* Form Fields */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="username" class="block mb-2 text-sm font-medium text-gray-900">
                    Username <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="username"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none focus:ring-0"
                    placeholder="Enter username..."
                    value={username()}
                    onInput={(e) => setUsername(e.currentTarget.value)}
                    disabled={loading()}
                    maxlength="50"
                    style="box-shadow: none;"
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251, 113, 133, 0.1)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label for="email" class="block mb-2 text-sm font-medium text-gray-900">
                    Email <span class="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none focus:ring-0"
                    placeholder="Enter email..."
                    value={email()}
                    onInput={(e) => setEmail(e.currentTarget.value)}
                    disabled={loading()}
                    style="box-shadow: none;"
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251, 113, 133, 0.1)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label for="age" class="block mb-2 text-sm font-medium text-gray-900">
                    Age <span class="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="number"
                    id="age"
                    min="1"
                    max="120"
                    class="w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none focus:ring-0"
                    placeholder="Enter age..."
                    value={age() || ""}
                    onInput={(e) => {
                      const val = e.currentTarget.value;
                      setAge(val ? parseInt(val) : null);
                    }}
                    disabled={loading()}
                    style="box-shadow: none;"
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251, 113, 133, 0.1)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                </div>

                <div>
                  <label for="gender" class="block mb-2 text-sm font-medium text-gray-900">
                    Gender <span class="text-gray-500">(optional)</span>
                  </label>
                  <div class="dropdown-container">
                    <select
                      id="gender"
                      class="dropdown-select w-full p-3 border border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none focus:ring-0"
                      value={gender()}
                      onChange={(e) => setGender(e.currentTarget.value)}
                      onFocus={(e) => {
                        handleGenderDropdownFocus();
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251, 113, 133, 0.1)';
                      }}
                      onBlur={(e) => {
                        handleGenderDropdownBlur();
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                      disabled={loading()}
                      style="box-shadow: none;"
                    >
                      <option value="">Select gender...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <svg
                      class={`dropdown-arrow ${isGenderDropdownOpen() ? 'open' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleUpdateProfile}
                  class="flex-1 text-white bg-rose-700 hover:bg-rose-800 hover:scale-105 font-medium rounded-lg text-sm px-5 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                  disabled={loading()}
                >
                  {loading() ? (
                    <>
                      <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <span>Save Profile</span>
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/profile')}
                  class="flex-1 text-rose-700 border border-rose-700 hover:bg-rose-100 hover:scale-105 font-medium rounded-lg text-sm px-5 py-3 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  disabled={loading()}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;