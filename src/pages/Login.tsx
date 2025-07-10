import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate, useLocation } from "@solidjs/router";
import { userStore } from "../components/userStore";

const Login: Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");
  const [showPassword, setShowPassword] = createSignal(false);
  const [rememberMe, setRememberMe] = createSignal(false);
  const [errors, setErrors] = createSignal<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  const [isExiting, setIsExiting] = createSignal(false);
  const [navigateTo, setNavigateTo] = createSignal<string | null>(null);

  const successMessage = new URLSearchParams(location.search).get("success") === "1";
  const googleAuthSuccess = new URLSearchParams(location.search).get("google-auth") === "success";

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

  // Handle Google auth redirect
  createEffect(() => {
    if (googleAuthSuccess) {
      setNavigateTo("/dashboard");
    }
  });

  const updateFormData = (field: string, value: string) => {
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    const newErrors = { ...errors() };
    delete newErrors[field];
    setErrors(newErrors);
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    const user = userStore.user;

    if (!email().trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email())) newErrors.email = "Invalid email format";
    else if (email() !== user.email) newErrors.email = "Incorrect email";

    if (!password()) newErrors.password = "Password is required";
    else if (password() !== user.password) newErrors.password = "Incorrect password";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = (e: Event) => {
    e.preventDefault();

    // Check if email and password are non-empty and valid format before showing loading state
    if (!email().trim() || !/\S+@\S+\.\S+/.test(email()) || !password()) {
      validateForm();
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }

      console.log("Login successful:", { email: email(), password: password(), rememberMe: rememberMe() });
      setIsLoading(false);
      setNavigateTo("/dashboard");
    }, 1500);
  };

  const handleGoogleLogin = () => {
    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    googleAuthUrl.searchParams.set("client_id", "mock-client-id");
    googleAuthUrl.searchParams.set("redirect_uri", "http://localhost:3000/login");
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "profile email");
    googleAuthUrl.searchParams.set("state", "google-auth");

    window.location.href = `${googleAuthUrl.toString()}?google-auth=success`;
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
          onClick={() => handleNavigate('/')}
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
            <h1 class="text-3xl font-semibold text-gray-800 mb-1">Welcome Back!</h1>
            <p class="text-gray-600 text-sm">Login to your MindMate account</p>
          </div>

          {successMessage && (
            <div class="bg-yellow-200 border border-gray-200 text-gray-800 px-4 py-2 mb-4 text-sm rounded-xl">
              Account created successfully!
            </div>
          )}

          <form onSubmit={handleLogin} class="space-y-6">
            <InputField
              label="Email"
              icon="email"
              placeholder="name@email.com"
              value={email()}
              error={errors().email}
              onInput={(e) => updateFormData("email", (e.target as HTMLInputElement).value)}
              type="email"
            />

            <PasswordInput
              label="Password"
              show={showPassword()}
              toggle={() => setShowPassword(!showPassword())}
              value={password()}
              error={errors().password}
              onInput={(e) => updateFormData("password", (e.target as HTMLInputElement).value)}
            />

            <div class="flex items-center justify-between">
              <label class="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe()}
                  onChange={(e) => setRememberMe(e.currentTarget.checked)}
                  class="w-4 h-4 border-gray-200 rounded focus:ring-rose-400"
                />
                <span class="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => handleNavigate('/forgot-password')}
                class="text-sm text-rose-700 hover:text-rose-900 font-medium"
              >
                Forgot password?
              </button>
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
                <span>Login</span>
              )}
            </button>
          </form>

          <div class="relative my-6">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-white/80 text-gray-600">or</span>
            </div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            class="w-full border-2 border-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center space-x-3"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Login with Google</span>
          </button>

          <p class="text-center text-gray-600 mt-6 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => handleNavigate('/register')}
              class="text-rose-700 hover:text-rose-900 font-semibold"
            >
              Register now
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

const InputField = (props: {
  label: string;
  value: string;
  error?: string;
  placeholder: string;
  onInput: (e: Event) => void;
  icon?: "email";
  type?: string;
}) => (
  <div>
    <label class="block text-sm font-semibold text-gray-800 mb-2">{props.label}</label>
    <div class="relative">
      <input
        type={props.type || "text"}
        value={props.value}
        onInput={props.onInput}
        placeholder={props.placeholder}
        class={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none pl-12 ${
          props.error ? "border-rose-900" : "border-gray-200 focus:border-rose-700"
        }`}
      />
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
        {props.icon === "email" && (
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        )}
      </span>
    </div>
    {props.error && <p class="text-rose-800 text-sm mt-1">{props.error}</p>}
  </div>
);

const PasswordInput = (props: {
  label: string;
  show: boolean;
  toggle: () => void;
  value: string;
  error?: string;
  onInput: (e: Event) => void;
}) => (
  <div>
    <label class="block text-sm font-semibold text-gray-800 mb-2">{props.label}</label>
    <div class="relative">
      <input
        type={props.show ? "text" : "password"}
        value={props.value}
        onInput={props.onInput}
        placeholder="Enter Password"
        class={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none pl-12 pr-12 ${
          props.error ? "border-rose-900" : "border-gray-200 focus:border-rose-700"
        }`}
      />
      <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <button type="button" class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" onClick={props.toggle}>
        {props.show ? (
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
    {props.error && <p class="text-rose-800 text-sm mt-1">{props.error}</p>}
  </div>
);

export default Login;