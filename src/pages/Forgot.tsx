import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { userStore } from "../components/userStore";

const ForgotPassword: Component = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [errors, setErrors] = createSignal<{ [key: string]: string }>({});
  const [success, setSuccess] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  const [isExiting, setIsExiting] = createSignal(false);
  const [navigateTo, setNavigateTo] = createSignal<string | null>(null);

  // Fade-in animation on mount
  createEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  });

  // Handle navigation with fade-out animation
  createEffect(() => {
    if (navigateTo()) {
      setIsExiting(true);
      setTimeout(() => navigate(navigateTo()!), 500); // Match transition duration
    }
  });

  // Clear success message after 3 seconds
  createEffect(() => {
    if (success()) setTimeout(() => setSuccess(""), 3000);
  });

  const updateFormData = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    const newErrors = { ...errors() };
    delete newErrors[field];
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email().trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email())) newErrors.email = "Invalid email format";
    else if (email().trim().toLowerCase() !== userStore.user.email.toLowerCase()) newErrors.email = "Email not found";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    // Check if email is non-empty and valid format before showing loading state
    if (!email().trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email())) {
      validateForm();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      setSuccess("A password reset link has been sent to your email.");
      setEmail("");
      setIsLoading(false);
      setNavigateTo('/login');
    }, 1500);
  };

  const handleNavigate = (path: string) => {
    setIsExiting(true);
    setNavigateTo(path);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-100 to-rose-100 flex items-center justify-center px-4">
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

      <div class={`relative w-full max-w-md transition-all duration-500 ease-in-out ${isVisible() && !isExiting() ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <button 
          onClick={() => handleNavigate('/login')}
          class="flex items-center text-rose-700 hover:text-rose-900 mb-6"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div class="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-gray-200">
          <div class="text-center mb-8">
            <div class="flex items-center justify-center space-x-2 mb-4">
              <div class="w-10 h-10 bg-rose-700 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold text-lg">M</span>
              </div>
              <span class="text-2xl font-semibold text-gray-800">MindMate</span>
            </div>
            <h1 class="text-3xl font-semibold text-gray-800 mb-1">Forgot Password</h1>
            <p class="text-gray-600 text-sm">Enter your email to reset your password</p>
          </div>

          {success() && (
            <div class="bg-yellow-200 border border-gray-200 text-gray-800 px-4 py-2 mb-4 text-sm rounded-xl">
              {success()}
            </div>
          )}

          <form onSubmit={handleSubmit} class="space-y-6">
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
                  <span>Processing...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>

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
            .animate-bubble { animation: bubble 6s ease-in-out infinite; 
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