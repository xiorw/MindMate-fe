import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";

const API_URL = "http://127.0.0.1:8080/api/auth/register";

const Register: Component = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = createSignal({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: ""
  });
  const [showPassword, setShowPassword] = createSignal(false);
  const [showConfirmPassword, setShowConfirmPassword] = createSignal(false);
  const [agreeTerms, setAgreeTerms] = createSignal(false);
  const [errors, setErrors] = createSignal<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = createSignal(false);
  const [isVisible, setIsVisible] = createSignal(false);
  const [isExiting, setIsExiting] = createSignal(false);
  const [navigateTo, setNavigateTo] = createSignal<string | null>(null);

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  });

  createEffect(() => {
    if (navigateTo()) {
      setIsExiting(true);
      setTimeout(() => navigate(navigateTo()!), 500);
    }
  });

  const updateFormData = (field: string, value: string) => {
    setFormData({ ...formData(), [field]: value });
    const newErrors = { ...errors() };
    delete newErrors[field];
    setErrors(newErrors);
  };

  const validateForm = () => {
    const data = formData();
    const newErrors: { [key: string]: string } = {};

    if (!data.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!data.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(data.email)) newErrors.email = "Invalid email format";

    if (!data.password) newErrors.password = "Password is required";
    else if (data.password.length < 6) newErrors.password = "Minimum 6 characters";

    if (!data.confirmPassword) newErrors.confirmPassword = "Confirmation required";
    else if (data.password !== data.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (!data.age) newErrors.age = "Age is required";
    else if (+data.age < 13 || +data.age > 100) newErrors.age = "Age must be 13–100 years";

    if (!data.gender) newErrors.gender = "Gender is required";
    if (!agreeTerms()) newErrors.terms = "You must agree to the terms & conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: Event) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData().fullName,
          email: formData().email,
          password: formData().password,
          age: parseInt(formData().age),
          gender: formData().gender,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setErrors({ api: result.message || "Registration failed" });
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setNavigateTo("/login?success=1");
    } catch (err) {
      setErrors({ api: "Network error. Please try again." });
      setIsLoading(false);
    }
  };

  const handleNavigate = (path: string) => {
    setIsExiting(true);
    setNavigateTo(path);
  };

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-100 to-rose-100 flex items-center justify-center py-16 px-4">
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
        <button onClick={() => handleNavigate('/login')} class="flex items-center text-rose-700 hover:text-rose-900 mb-6">
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
            <h1 class="text-3xl font-semibold text-gray-800 mb-1">Let's Get Started!</h1>
            <p class="text-gray-600 text-sm">Start your mental health journey</p>
          </div>

          <form onSubmit={handleRegister} class="space-y-6">
            <InputField
              label="Full Name"
              icon="user"
              placeholder="e.g. John Doe"
              value={formData().fullName}
              error={errors().fullName}
              onInput={(e) => updateFormData("fullName", (e.target as HTMLInputElement).value)}
            />

            <InputField
              label="Email"
              icon="email"
              placeholder="name@email.com"
              value={formData().email}
              error={errors().email}
              onInput={(e) => updateFormData("email", (e.target as HTMLInputElement).value)}
              type="email"
            />

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Age</label>
                <input
                  type="number"
                  min="13"
                  max="100"
                  value={formData().age}
                  onInput={(e) => updateFormData("age", (e.target as HTMLInputElement).value)}
                  class={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none ${
                    errors().age ? "border-rose-900" : "border-gray-200 focus:border-rose-700"
                  }`}
                  placeholder="25"
                />
                {errors().age && <p class="text-rose-800 text-sm mt-1">{errors().age}</p>}
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-800 mb-2">Gender</label>
                <div class="relative">
                  <select
                    value={formData().gender}
                    onChange={(e) => updateFormData("gender", (e.target as HTMLSelectElement).value)}
                    class={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none appearance-none pr-10 ${
                      errors().gender ? "border-rose-900" : "border-gray-200 focus:border-rose-700"
                    }`}
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  <svg
                    class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors().gender && <p class="text-rose-800 text-sm mt-1">{errors().gender}</p>}
              </div>
            </div>

            <PasswordInput
              label="Password"
              show={showPassword()}
              toggle={() => setShowPassword(!showPassword())}
              value={formData().password}
              error={errors().password}
              onInput={(e) => updateFormData("password", (e.target as HTMLInputElement).value)}
            />

            <PasswordInput
              label="Confirm Password"
              show={showConfirmPassword()}
              toggle={() => setShowConfirmPassword(!showConfirmPassword())}
              value={formData().confirmPassword}
              error={errors().confirmPassword}
              onInput={(e) => updateFormData("confirmPassword", (e.target as HTMLInputElement).value)}
            />

            <div class="flex items-start gap-2">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms()}
                onChange={(e) => setAgreeTerms((e.target as HTMLInputElement).checked)}
                class="mt-1 w-4 h-4 text-rose-600 border-gray-200 rounded focus:ring-rose-400"
              />
              <label for="terms" class="text-sm text-gray-600">
                I agree to the <span class="text-rose-700 hover:text-rose-900 hover:underline">Terms & Conditions</span>
              </label>
            </div>
            {errors().terms && <p class="text-rose-900 text-sm">{errors().terms}</p>}
            {errors().api && <p class="text-rose-900 text-sm">{errors().api}</p>}

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
                <span>Register</span>
              )}
            </button>
          </form>
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
  icon?: "email" | "user";
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
        {props.icon === "user" && (
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
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
        autocomplete="new-password"
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268-2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
    {props.error && <p class="text-rose-800 text-sm mt-1">{props.error}</p>}
  </div>
);

export default Register;