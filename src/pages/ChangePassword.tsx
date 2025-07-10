import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { updateUser } from "../components/userStore";

const ChangePassword: Component = () => {
  const navigate = useNavigate();
  const [password, setPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
  const [error, setError] = createSignal("");
  const [success, setSuccess] = createSignal("");
  const [isVisible, setIsVisible] = createSignal(false);

  // Initialize visibility effect
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);
  });

  // Handle password change
  const handleChangePassword = () => {
    if (!password() || password().length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password() !== confirmPassword()) {
      setError("Passwords do not match.");
      return;
    }

    // Update user password using updateUser
    updateUser({
      password: password(),
    });

    setError("");
    setSuccess("Password changed successfully!");
    setPassword("");
    setConfirmPassword("");
    setTimeout(() => {
      setSuccess("");
      navigate('/profile');
    }, 2000);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class={`transition-all duration-1000 ${isVisible() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 class="text-3xl md:text-4xl font-bold text-rose-800 mb-6">Change Password</h1>

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

          {/* Password Change Form */}
          <div class="max-w-full p-6 bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md">
            <div class="space-y-6">
              {/* New Password Input */}
              <div>
                <label for="password" class="block mb-2 text-sm font-medium text-gray-900">New Password</label>
                <div class="relative">
                  <input
                    type={showPassword() ? "text" : "password"}
                    id="password"
                    class={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none pl-12 pr-12 no-native-eye ${error() ? "border-rose-900" : "border-gray-300 focus:border-rose-700"}`}
                    placeholder="Enter new password"
                    value={password()}
                    onInput={(e) => setPassword(e.currentTarget.value)}
                  />
                  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                {error() && error().includes("Password must be at least 6 characters") && (
                  <p class="text-rose-800 text-sm mt-1">{error()}</p>
                )}
              </div>

              {/* Confirm Password Input */}
              <div>
                <label for="confirm-password" class="block mb-2 text-sm font-medium text-gray-900">Confirm Password</label>
                <div class="relative">
                  <input
                    type={showConfirmPassword() ? "text" : "password"}
                    id="confirm-password"
                    class={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none pl-12 pr-12 no-native-eye ${error() ? "border-rose-900" : "border-gray-300 focus:border-rose-700"}`}
                    placeholder="Confirm new password"
                    value={confirmPassword()}
                    onInput={(e) => setConfirmPassword(e.currentTarget.value)}
                  />
                  <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                {error() && error().includes("Passwords do not match") && (
                  <p class="text-rose-800 text-sm mt-1">{error()}</p>
                )}
              </div>

              {/* Form Actions */}
              <div class="flex space-x-4">
                <button
                  onClick={handleChangePassword}
                  class="text-white bg-rose-700 hover:bg-rose-800 hover:scale-105 font-medium rounded-lg text-sm px-5 py-2.5 transition-transform duration-200"
                >
                  Save Password
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