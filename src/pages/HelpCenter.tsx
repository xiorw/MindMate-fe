import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { gsap } from "gsap";

const HelpCenter: Component = () => {
  const [formData, setFormData] = createSignal({ name: "", email: "", message: "" });
  const [errors, setErrors] = createSignal({ name: false, email: false, message: false });
  const [showSuccess, setShowSuccess] = createSignal(false);

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setFormData({ ...formData(), [target.name]: target.value });
    // Reset error state when user types
    setErrors({ ...errors(), [target.name]: false });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    const newErrors = {
      name: formData().name.trim() === "",
      email: !validateEmail(formData().email),
      message: formData().message.trim() === "",
    };
    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email && !newErrors.message) {
      console.log("Form submitted:", formData());
      setShowSuccess(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setShowSuccess(false), 3000); // Hide success message after 3 seconds
    }
  };

  createEffect(() => {
    const container = document.querySelector(".help-container");
    const title = document.querySelector(".help-title");
    const faqSection = document.querySelector(".faq-section");
    const formSection = document.querySelector(".form-section");

    // In animations for all elements
    if (container) {
      gsap.from(container, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0,
      });
      // Pulsating shadow effect
      gsap.to(container, {
        boxShadow: "0 0 10px rgba(251, 113, 133, 0.5)",
        duration: 1,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });
    }
    if (title) {
      gsap.from(title, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.1,
      });
    }
    if (faqSection) {
      gsap.from(faqSection, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3,
      });
    }
    if (formSection) {
      gsap.from(formSection, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.5,
      });
    }
  });

  onCleanup(() => {
    const container = document.querySelector(".help-container");
    const title = document.querySelector(".help-title");
    const faqSection = document.querySelector(".faq-section");
    const formSection = document.querySelector(".form-section");

    // Out animations for all elements
    if (container) {
      gsap.to(container, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in",
        onComplete: () => {
          gsap.to(container, {
            boxShadow: "0 0 0 rgba(251, 113, 133, 0)",
            duration: 0.8,
            ease: "sine.inOut",
          });
        },
      });
    }
    if (title) {
      gsap.to(title, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in",
        delay: 0.1,
      });
    }
    if (faqSection) {
      gsap.to(faqSection, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in",
        delay: 0.2,
      });
    }
    if (formSection) {
      gsap.to(formSection, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in",
        delay: 0.3,
      });
    }
  });

  const bubblePositions = [
    { left: '5%', top: '10%' },  // Left, top
    { left: '10%', top: '30%' }, // Left, upper-middle
    { left: '15%', top: '50%' }, // Left, middle
    { left: '20%', top: '70%' }, // Left, lower-middle
    { left: '10%', top: '90%' }, // Left, bottom
    { left: '85%', top: '15%' }, // Right, top
    { left: '90%', top: '35%' }, // Right, upper-middle
    { left: '95%', top: '55%' }, // Right, middle
    { left: '80%', top: '75%' }, // Right, lower-middle
    { left: '85%', top: '95%' }, // Right, bottom
    { left: '50%', top: '20%' }, // Center, top
    { left: '50%', top: '80%' }, // Center, bottom
  ];

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-100 to-rose-100 relative overflow-hidden">
      {/* Parallax Background with Bubbles */}
      <div class="absolute inset-0 overflow-hidden pointer-events-none">
        {bubblePositions.map((pos, i) => (
          <div
            class={`absolute bg-white rounded-full ${i % 3 === 0 ? 'animate-bubble' : i % 3 === 1 ? 'animate-bubble-slow' : 'animate-bubble-fast'}`}
            style={{
              width: `${Math.random() * 50 + 20}px`,
              height: `${Math.random() * 50 + 20}px`,
              left: pos.left,
              top: pos.top,
              "animation-duration": `${Math.random() * 6 + 3}s`,
              "animation-delay": `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6 help-title">Help Center</h1>
        <div class="bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md p-6 help-container">
          <div class="faq-section">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-rose-200 to-white p-4 rounded-md">
                <h3 class="text-lg font-medium text-gray-800">How do I track my mood?</h3>
                <p class="text-sm text-gray-600">Go to the Mood Tracker page, select your current mood using the emoji buttons, and add optional notes. Your mood will be saved and displayed in your dashboard.</p>
              </div>
              <div class="bg-gradient-to-r from-rose-200 to-white p-4 rounded-md">
                <h3 class="text-lg font-medium text-gray-800">Can I edit my journal entries?</h3>
                <p class="text-sm text-gray-600">Yes, navigate to the Journal page, select the entry you want to edit, and update the content. All changes are saved automatically.</p>
              </div>
              <div class="bg-gradient-to-r from-rose-200 to-white p-4 rounded-md">
                <h3 class="text-lg font-medium text-gray-800">How do I reset my password?</h3>
                <p class="text-sm text-gray-600">Use the "Forgot Password" link on the login page to receive a reset link via email.</p>
              </div>
            </div>
          </div>

          <div class="form-section">
            <h2 class="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Support</h2>
            {showSuccess() && (
              <div class="bg-green-100 border-l-4 border-green-600 p-4 mb-4 rounded-md flex items-center">
                <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p class="text-green-600">Thank you for your message! Our support team will get back to you soon.</p>
              </div>
            )}
            <form onSubmit={handleSubmit} class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData().name}
                  onInput={handleInputChange}
                  class={`mt-1 block w-full rounded-md border-2 ${
                    errors().name ? "border-rose-800" : "border-gray-300 focus:border-rose-700 focus:outline-none"
                  } focus:ring-rose-700 text-base p-2 transition-colors`}
                  required
                />
              </div>
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData().email}
                  onInput={handleInputChange}
                  class={`mt-1 block w-full rounded-md border-2 ${
                    errors().email ? "border-rose-800" : "border-gray-300 focus:border-rose-700 focus:outline-none"
                  } focus:ring-rose-700 text-base p-2 transition-colors`}
                  required
                />
              </div>
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700">Message</label>
                <textarea
                  name="message"
                  value={formData().message}
                  onInput={handleInputChange}
                  class={`mt-1 block w-full rounded-md border-2 ${
                    errors().message ? "border-rose-800" : "border-gray-300 focus:border-rose-700 focus:outline-none"
                  } focus:ring-rose-700 text-base p-2 transition-colors`}
                  rows={6}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                class="bg-rose-700 text-white px-4 py-2 rounded-md hover:bg-rose-800 transition-colors text-base font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Custom CSS for Bubble Animation */}
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
          .animate-bubble { animation: bubble 6s ease-in-out infinite; opacity: 0.5; }
          .animate-bubble-slow { animation: bubble-slow 9s ease-in-out infinite; opacity: 0.5; }
          .animate-bubble-fast { animation: bubble-fast 3s ease-in-out infinite; opacity: 0.5; }
        `}
      </style>
    </div>
  );
};

export default HelpCenter;