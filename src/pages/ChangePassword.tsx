import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

// API URLs - consistent with ForgotPassword component pattern
const USER_API_URL = "https://mindmate-be-production.up.railway.app/api/user";

const ChangePassword: Component = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal(false);
  const [showNewPassword, setShowNewPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isExiting, setIsExiting] = createSignal(false);

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Clear success message and handle navigation
  createEffect(() => {
    if (success()) {
      setTimeout(() => {
        setSuccess("");
        setIsExiting(true);
        setTimeout(() => navigate('/profile'), 500);
      }, 2000);
    }
  });

  // Handle password change
  const handleChangePassword = async (e: Event) => {
    e.preventDefault();
    
    // Validate inputs
    const newErrors: { [key: string]: string } = {};
    if (!oldPassword().trim()) {
      newErrors.oldPassword = "Current password is required";
    }
    if (!newPassword().trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword().length < 6) {
      newErrors.newPassword = "New password must be at least 6 characters";
    }
    if (!confirmPassword().trim()) {
      newErrors.confirmPassword = "Please confirm your new password";
    } else if (newPassword() !== confirmPassword()) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setError("");
    if (Object.keys(newErrors).length > 0) {
      setError(Object.values(newErrors)[0]);
      return;
    }

    setIsLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem("token");
      if (!token) {
        setError("No authentication token found. Please log in again.");
        setIsLoading(false);
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // API call to update password
      const response = await fetch(`${USER_API_URL}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          old_password: oldPassword(),
          new_password: newPassword()
        })
      });

      const result = await response.json();

      setTimeout(() => {
        if (response.ok) {
          setSuccess("Password changed successfully!");
          setOldPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          setError(result.message || "Failed to change password. Please try again.");
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      setTimeout(() => {
        setError("Network error. Please try again.");
        setIsLoading(false);
      }, 1000);
    }
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() && !isExiting() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>

          <div class="flex justify-between items-center mb-6">
            <h1 class="text-3xl md:text-4xl font-bold text-rose-700">Change Password</h1>
          </div>

          {/* Success Alert */}
          {success() && (
            <div class="flex items-center p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200 shadow-sm" role="alert">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207l-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414z"/>
              </svg>
              <span class="font-medium">{success()}</span>
            </div>
          )}

          {/* Error Alert */}
          {error() && (
            <div class="flex items-center p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200 shadow-sm" role="alert">
              <svg class="flex-shrink-0 inline w-4 h-4 me-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5zM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2z"/>
              </svg>
              <span class="font-medium">{error()}</span>
            </div>
          )}

          {/* Password Change Form */}
          <div class="max-w-full p-6 bg-white/80 border border-rose-200 rounded-2xl shadow-xl backdrop-blur-md">
            <div class="flex items-center mb-6">
              <div class="flex-shrink-0 w-12 h-12 bg-rose-700 rounded-full flex items-center justify-center">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div class="ml-4">
                <h3 class="text-lg font-semibold text-gray-900">Update Your Password</h3>
                <p class="text-sm text-gray-600">Please enter your current password and choose a new secure password.</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} class="space-y-6">
              {/* Current Password Input */}
              <div>
                <label for="old-password" class="block mb-2 text-sm font-medium text-gray-900">
                  Current Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    type={showPassword() ? "text" : "password"}
                    id="old-password"
                    class="w-full p-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none focus:ring-0 no-native-eye"
                    placeholder="Enter current password..."
                    value={oldPassword()}
                    onInput={(e) => setOldPassword(e.currentTarget.value)}
                    style="box-shadow: none;"
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251, 113, 133, 0.1)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                    onClick={() => setShowPassword(!showPassword())}
                  >
                    {showPassword() ? (
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* New Password Input */}
              <div>
                <label for="new-password" class="block mb-2 text-sm font-medium text-gray-900">
                  New Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    type={showNewPassword() ? "text" : "password"}
                    id="new-password"
                    class="w-full p-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none focus:ring-0 no-native-eye"
                    placeholder="Enter new password..."
                    value={newPassword()}
                    onInput={(e) => setNewPassword(e.currentTarget.value)}
                    style="box-shadow: none;"
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251, 113, 133, 0.1)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                    onClick={() => setShowNewPassword(!showNewPassword())}
                  >
                    {showNewPassword() ? (
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p class="text-xs text-gray-500 mt-1">Password must be at least 6 characters long</p>
              </div>

              {/* Confirm New Password Input */}
              <div>
                <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900">
                  Confirm New Password <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <input
                    type={showConfirmPassword() ? "text" : "password"}
                    id="confirm-password"
                    class="w-full p-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:border-rose-500 focus:outline-none focus:ring-0 no-native-eye"
                    placeholder="Confirm new password..."
                    value={confirmPassword()}
                    onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                    style="box-shadow: none;"
                    onFocus={(e) => e.currentTarget.style.boxShadow = '0 0 0 3px rgba(251, 113, 133, 0.1)'}
                    onBlur={(e) => e.currentTarget.style.boxShadow = 'none'}
                  />
                  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-rose-500 transition-colors"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword())}
                  >
                    {showConfirmPassword() ? (
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {newPassword() && (
                <div class="bg-gray-50 p-3 rounded-lg border border-green-500">
                  <p class="text-sm font-medium text-gray-700 mb-2">Password Strength:</p>
                  <div class="flex space-x-1">
                    <div class={`h-2 w-full rounded ${newPassword().length >= 6 ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                    <div class={`h-2 w-full rounded ${newPassword().length >= 8 && /[A-Z]/.test(newPassword()) ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                    <div class={`h-2 w-full rounded ${newPassword().length >= 8 && /[A-Z]/.test(newPassword()) && /[0-9]/.test(newPassword()) ? 'bg-green-400' : 'bg-gray-200'}`}></div>
                  </div>
                  <div class="flex flex-wrap gap-2 mt-2 text-xs">
                    <span class={`${newPassword().length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                      ✓ At least 6 characters
                    </span>
                    <span class={`${/[A-Z]/.test(newPassword()) ? 'text-green-600' : 'text-gray-500'}`}>
                      ✓ Uppercase letter
                    </span>
                    <span class={`${/[0-9]/.test(newPassword()) ? 'text-green-600' : 'text-gray-500'}`}>
                      ✓ Number
                    </span>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div class="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={isLoading()}
                  class="flex-1 text-white bg-rose-700 hover:bg-rose-800 hover:scale-105 font-medium rounded-lg text-sm px-5 py-3 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {isLoading() ? (
                    <>
                      <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <span>Update Password</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsExiting(true);
                    setTimeout(() => navigate('/profile'), 500);
                  }}
                  class="flex-1 text-rose-700 border border-rose-700 hover:bg-rose-100 hover:scale-105 font-medium rounded-lg text-sm px-5 py-3 transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  disabled={isLoading()}
                >
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <style>
        {`
          .no-native-eye::-ms-reveal,
          .no-native-eye::-webkit-textfield-decoration-container {
            display: none;
          }
        `}
      </style>
    </div>
  );
};

export default ChangePassword;