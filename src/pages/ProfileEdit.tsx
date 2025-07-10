import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { userStore, updateUser } from "../components/userStore";

const ProfileEdit: Component = () => {
  const navigate = useNavigate();
  const [name, setName] = createSignal(userStore.user.name);
  const [email, setEmail] = createSignal(userStore.user.email);
  const [avatar, setAvatar] = createSignal<File | null>(null);
  const [avatarPreview, setAvatarPreview] = createSignal<string | null>(userStore.user.avatar);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Compute initials based on name
  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length === 0 || !name.trim()) return "U";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words.slice(0, 2).map(word => word.charAt(0).toUpperCase()).join("");
  };

  // Handle avatar file change and convert to Base64
  const handleAvatarChange = (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAvatar(null);
      setAvatarPreview(userStore.user.avatar);
    }
  };

  // Handle reset to default avatar
  const handleResetAvatar = () => {
    const initial = getInitials(name());
    const defaultAvatar = `data:image/svg+xml;base64,${btoa(`
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#be123c;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#9f1239;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#grad)"/>
        <text x="50" y="65" font-family="Arial" font-size="40" fill="white" text-anchor="middle">${initial}</text>
      </svg>
    `)}`;
    setAvatarPreview(defaultAvatar);
    setAvatar(null);
  };

  // Handle profile update
  const handleUpdateProfile = () => {
    if (!name().trim()) {
      setError("Name is required.");
      return;
    }
    if (name().trim().length < 2) {
      setError("Name must be at least 2 characters long.");
      return;
    }
    if (!email().trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email())) {
      setError("Valid email is required.");
      return;
    }

    // Set default avatar if no custom avatar is uploaded
    let finalAvatar = avatarPreview();
    if (!avatar() && (!finalAvatar || finalAvatar === userStore.user.avatar)) {
      const initial = getInitials(name());
      finalAvatar = `data:image/svg+xml;base64,${btoa(`
        <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#be123c;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#9f1239;stop-opacity:1" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#grad)"/>
          <text x="50" y="65" font-family="Arial" font-size="40" fill="white" text-anchor="middle">${initial}</text>
        </svg>
      `)}`;
      setAvatarPreview(finalAvatar);
    }

    // Update user with a single object
    updateUser({
      name: name().trim(),
      email: email().trim(),
      avatar: finalAvatar,
    });

    setError("");
    setSuccess("Profile updated successfully!");
    setTimeout(() => {
      setSuccess("");
      navigate('/profile');
    }, 2000);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-800 mb-6">Edit Profile</h1>

          {/* Success Alert */}
          {success() && (
            <div class="flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200" role="alert">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414z"/>
              </svg>
              <span class="sr-only">Success</span>
              <div>{success()}</div>
            </div>
          )}

          {/* Error Alert */}
          {error() && (
            <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200" role="alert">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5zM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2z"/>
              </svg>
              <span class="sr-only">Error</span>
              <div>{error()}</div>
            </div>
          )}

          {/* Edit Profile Form */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <div class="space-y-6">
              {/* Name Input */}
              <div>
                <label for="name" class="block mb-2 text-sm font-medium text-gray-900">Name</label>
                <input
                  type="text"
                  id="name"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-700 focus:border-rose-700 focus:outline-none"
                  placeholder="Enter your name..."
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                />
              </div>

              {/* Email Input */}
              <div>
                <label for="email" class="block mb-2 text-sm font-medium text-gray-900">Email</label>
                <input
                  type="email"
                  id="email"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-700 focus:border-rose-700 focus:outline-none"
                  placeholder="Enter your email..."
                  value={email()}
                  onInput={(e) => setEmail(e.currentTarget.value)}
                />
              </div>

              {/* Avatar Upload */}
              <div>
                <label for="avatar" class="block mb-2 text-sm font-medium text-gray-900">Avatar</label>
                <input
                  type="file"
                  id="avatar"
                  accept="image/*"
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-rose-700 focus:border-rose-700"
                  onChange={handleAvatarChange}
                />
                {avatarPreview() && (
                  <img
                    src={avatarPreview()!}
                    alt="Avatar Preview"
                    class="w-16 h-16 rounded-full mt-4 object-cover"
                  />
                )}
                <button
                  onClick={handleResetAvatar}
                  class="mt-2 text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                  Use Default Avatar
                </button>
              </div>

              {/* Form Actions */}
              <div class="flex space-x-4">
                <button
                  onClick={handleUpdateProfile}
                  class="text-white bg-rose-700 hover:bg-rose-800 hover:scale-105 font-medium rounded-lg text-sm px-5 py-2.5 transition-transform duration-200"
                >
                  Save Profile
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                  Cancel
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