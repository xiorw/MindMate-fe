import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

// API URLs - consistent with Calendar component pattern
const USER_API_URL = "http://127.0.0.1:8080/api/user";

const ForgotPassword: Component = () => {
  const navigate = useNavigate();
  
  // Form states
  const [email, setEmail] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");
  const [confirmPassword, setConfirmPassword] = createSignal("");
  
  // UI states
  const [errors, setErrors] = createSignal<{ [key: string]: string }>({});
  const [success, setSuccess] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  const [isExiting, setIsExiting] = createSignal(false);
  const [navigateTo, setNavigateTo] = createSignal<string | null>(null);
  
  // Step management
  const [currentStep, setCurrentStep] = createSignal<'email' | 'password'>('email');
  const [isTransitioning, setIsTransitioning] = createSignal(false);
  
  // Password visibility
  const [showNewPassword, setShowNewPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);

  // Fade-in animation on mount
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  });

  // Handle navigation with fade-out animation
  createEffect(() => {
    if (navigateTo()) {
      setIsExiting(true);
      setTimeout(() => navigate(navigateTo()!), 500);
    }
  });

  // Clear success message after 3 seconds
  createEffect(() => {
    if (success()) setTimeout(() => setSuccess(""), 3000);
  });

  const updateFormData = (field: string, value: string) => {
    switch (field) {
      case "email": setEmail(value); break;
      case "newPassword": setNewPassword(value); break;
      case "confirmPassword": setConfirmPassword(value); break;
    }
    
    const newErrors = { ...errors() };
    delete newErrors[field];
    setErrors(newErrors);
  };

  const validateEmailStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email().trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email())) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordStep = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newPassword().trim()) {
      newErrors.newPassword = "New password is required";
    } else if (newPassword().length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!confirmPassword().trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword() !== confirmPassword()) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSubmit = async (e: Event) => {
    e.preventDefault();

    if (!validateEmailStep()) {
      return;
    }

    setIsLoading(true);

    try {
      // API call to check if email exists in database - using consistent API pattern
      const response = await fetch(`${USER_API_URL}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email().trim()
        })
      });

      const data = await response.json();

      setTimeout(() => {
        if (response.ok && data.exists) {
          setIsLoading(false);
          setSuccess("Email found! Please enter your passwords.");
          
          // Start transition to password step
          setIsTransitioning(true);
          setTimeout(() => {
            setCurrentStep('password');
            setIsTransitioning(false);
          }, 300);
        } else {
          // Email not found in database
          setErrors({ email: "Email not found in our system" });
          setIsLoading(false);
        }
      }, 1000);
    } catch (error) {
      // Network error handling
      setTimeout(() => {
        setErrors({ email: "Network error. Please try again." });
        setIsLoading(false);
      }, 1000);
    }
  };

  const handlePasswordSubmit = async (e: Event) => {
    e.preventDefault();

    if (!validatePasswordStep()) {
      return;
    }

    setIsLoading(true);

    try {
      // API call to reset password - using consistent API pattern
      const response = await fetch(`${USER_API_URL}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email(),
          new_password: newPassword(),
          confirm_password: confirmPassword()
        })
      });

      setTimeout(() => {
        if (response.ok) {
          setSuccess("Password updated successfully! Redirecting to login...");
          setIsLoading(false);
          
          // Clear form
          setEmail("");
          setNewPassword("");
          setConfirmPassword("");
          
          // Navigate after success message
          setTimeout(() => {
            setNavigateTo('/login');
          }, 2000);
        } else {
          setErrors({ general: "Failed to reset password. Please try again." });
          setIsLoading(false);
        }
      }, 1500);
    } catch (error) {
      setTimeout(() => {
        setErrors({ general: "Network error. Please try again." });
        setIsLoading(false);
      }, 1500);
    }
  };

  const handleNavigate = (path: string) => {
    setIsExiting(true);
    setNavigateTo(path);
  };

  const goBackToEmail = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep('email');
      setIsTransitioning(false);
      setErrors({});
      setSuccess("");
    }, 300);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-100 to-rose-100 flex items-center justify-center px-4 py-8">
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            class="absolute bg-white rounded-full animate-bubble"
            style={{
              width: `${Math.random() * 50 + 20}px`,
              height: `${Math.random() * 50 + 20}px`,
              left: `${Math.random() * 100}vw`,
              top: `${Math.random() * 100}vh`,
              "animation-duration": `${Math.random() * 10 + 10}s`,
              "animation-delay": `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div class={`relative w-full max-w-md transition-all duration-500 ease-in-out my-8 ${isVisible() && !isExiting() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <button 
          onClick={() => currentStep() === 'email' ? handleNavigate('/login') : goBackToEmail()}
          class="flex items-center text-rose-700 hover:text-rose-900 mb-6"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          {currentStep() === 'email' ? 'Back' : 'Back to Email'}
        </button>

        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200 relative overflow-hidden my-4">
          <div class="text-center mb-8">
            <div class="flex items-center justify-center space-x-2 mb-4">
              <div class="w-10 h-10 bg-rose-700 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-lg">M</span>
              </div>
              <span class="text-2xl font-semibold text-gray-800">MindMate</span>
            </div>
            <h1 class="text-3xl font-semibold text-gray-800 mb-1">
              {currentStep() === 'email' ? 'Forgot Password' : 'Reset Password'}
            </h1>
            <p class="text-gray-600 text-sm">
              {currentStep() === 'email' 
                ? 'Enter your email to reset your password'
                : 'Enter your new password'
              }
            </p>
          </div>

          {success() && (
            <div class="bg-yellow-200 border border-gray-200 text-gray-800 px-4 py-2 mb-4 text-sm rounded-xl">
              {success()}
            </div>
          )}

          {errors().general && (
            <div class="bg-red-100 border border-red-200 text-red-800 px-4 py-2 mb-4 text-sm rounded-xl">
              {errors().general}
            </div>
          )}

          {/* Step Indicator */}
          <div class="flex justify-center mb-6">
            <div class="flex items-center space-x-4">
              <div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep() === 'email' ? 'bg-rose-700 text-white' : 'bg-rose-200 text-rose-700'
              }`}>
                1
              </div>
              <div class={`w-8 h-1 transition-all duration-300 ${
                currentStep() === 'password' ? 'bg-rose-700' : 'bg-gray-200'
              }`}></div>
              <div class={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                currentStep() === 'password' ? 'bg-rose-700 text-white' : 'bg-gray-200 text-gray-400'
              }`}>
                2
              </div>
            </div>
          </div>

          {/* Email Step */}
          <div class={`transition-all duration-300 ${
            currentStep() === 'email' && !isTransitioning() 
              ? 'opacity-100 translate-x-0' 
              : currentStep() === 'email' 
                ? 'opacity-0 -translate-x-full' 
                : 'opacity-0 translate-x-full absolute inset-x-0'
          }`}>
            <form onSubmit={handleEmailSubmit} class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Email</label>
                <div class="relative">
                  <input
                    type="email"
                    value={email()}
                    onInput={(e) => updateFormData("email", e.currentTarget.value)}
                    placeholder="name@email.com"
                    class={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none pl-12 ${
                      errors().email ? "border-rose-900" : "border-gray-200 focus:border-rose-700"
                    }`}
                  />
                  <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
                {errors().email && <p class="text-rose-800 text-sm mt-1">{errors().email}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading()}
                class="w-full bg-rose-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading() ? (
                  <>
                    <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="8" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Checking Email...</span>
                  </>
                ) : (
                  <span>Check Email</span>
                )}
              </button>
            </form>
          </div>

          {/* Password Step */}
          <div class={`transition-all duration-300 ${
            currentStep() === 'password' && !isTransitioning() 
              ? 'opacity-100 translate-x-0' 
              : currentStep() === 'password' 
                ? 'opacity-0 translate-x-full' 
                : 'opacity-0 -translate-x-full absolute inset-x-0'
          }`}>
            <form onSubmit={handlePasswordSubmit} class="space-y-6">
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">New Password</label>
                <div class="relative">
                  <input
                    type={showNewPassword() ? "text" : "password"}
                    value={newPassword()}
                    onInput={(e) => updateFormData("newPassword", e.currentTarget.value)}
                    placeholder="Enter your new password"
                    class={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none pl-12 pr-12 ${
                      errors().newPassword ? "border-rose-900" : "border-gray-200 focus:border-rose-700"
                    }`}
                  />
                  <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword())}
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                {errors().newPassword && <p class="text-rose-800 text-sm mt-1">{errors().newPassword}</p>}
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Confirm New Password</label>
                <div class="relative">
                  <input
                    type={showConfirmPassword() ? "text" : "password"}
                    value={confirmPassword()}
                    onInput={(e) => updateFormData("confirmPassword", e.currentTarget.value)}
                    placeholder="Confirm your new password"
                    class={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none pl-12 pr-12 ${
                      errors().confirmPassword ? "border-rose-900" : "border-gray-200 focus:border-rose-700"
                    }`}
                  />
                  <svg class="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword())}
                    class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                {errors().confirmPassword && <p class="text-rose-800 text-sm mt-1">{errors().confirmPassword}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading()}
                class="w-full bg-rose-700 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading() ? (
                  <>
                    <svg class="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="8" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Resetting...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </form>
          </div>

          <p class="text-center text-gray-600 mt-6 text-sm">
            Remembered your password?{" "}
            <button
              onClick={() => handleNavigate('/login')}
              class="text-rose-700 hover:text-rose-900 font-semibold"
            >
              Login now
            </button>
          </p>
        </div>
      </div>

      <style>
        {`
          @keyframes bubble {
            0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
            50% { transform: translateY(-40px) translateX(20px) scale(1.15) rotate(10deg); }
            100% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
          }
          @keyframes bubble-slow {
            0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
            50% { transform: translateY(-30px) translateX(-15px) scale(0.9) rotate(-8deg); }
            100% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
          }
          @keyframes bubble-fast {
            0% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
            50% { transform: translateY(-50px) translateX(25px) scale(1.1) rotate(12deg); }
            100% { transform: translateY(0) translateX(0) scale(1) rotate(0deg); }
          }
          .animate-bubble { 
            animation: bubble 6s ease-in-out infinite; 
            opacity: 0.5;
          }
          .animate-bubble-slow { animation: bubble-slow 9s ease-in-out infinite; }
          .animate-bubble-fast { animation: bubble-fast 3s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
};

export default ForgotPassword;