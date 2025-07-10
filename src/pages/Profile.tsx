import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { userStore } from "../components/userStore"; // Import userStore from components folder

const Profile: Component = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = createSignal(false);

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Handle logout
  const handleLogout = () => {
    navigate('/login'); // Hypothetical login page
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6">Profile</h1>

          {/* Profile Card */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <h5 class="text-xl font-medium text-gray-900 mb-6">User Profile</h5>
            <div class="space-y-4">
              {/* Avatar */}
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gradient-to-r from-rose-600 to-rose-800 rounded-full flex items-center justify-center">
                  {userStore.user.avatar ? (
                    <img src={userStore.user.avatar} alt="Avatar" class="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <span class="text-white font-semibold text-xl">{userStore.user.name.charAt(0)}</span>
                  )}
                </div>
                <div>
                  <h6 class="text-lg font-medium text-gray-800">Avatar</h6>
                  <p class="text-sm text-gray-600">{userStore.user.avatar ? 'Custom avatar set' : 'Default avatar'}</p>
                </div>
              </div>

              {/* Name */}
              <div>
                <h6 class="text-lg font-medium text-gray-800">Name</h6>
                <p class="text-sm text-gray-600">{userStore.user.name}</p>
              </div>

              {/* Email */}
              <div>
                <h6 class="text-lg font-medium text-gray-800">Email</h6>
                <p class="text-sm text-gray-600">{userStore.user.email}</p>
              </div>

              {/* Navigation Buttons */}
              <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-6">
                <button
                  onClick={() => navigate('/profile/edit')}
                  class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => navigate('/profile/change-password')}
                  class="text-rose-700 border border-rose-700 hover:bg-rose-100 font-medium rounded-lg text-sm px-5 py-2.5 transition-colors"
                >
                  Change Password
                </button>
                <button
                  onClick={handleLogout}
                  class="text-white bg-rose-700 hover:bg-rose-800 hover:scale-105 font-medium rounded-lg text-sm px-5 py-2.5 transition-transform duration-200"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;