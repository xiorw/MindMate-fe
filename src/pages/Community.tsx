import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { gsap } from "gsap";

const Community: Component = () => {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [error, setError] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleJoin = (e: Event) => {
    e.preventDefault();
    if (!email().trim() || !validateEmail(email())) {
      setError(true);
      return;
    }
    setError(false);
    console.log("Joined with email:", email());
    setShowSuccess(true);
    setEmail("");
    setTimeout(() => setShowSuccess(false), 3000); // Hide success message after 3 seconds
  };

  createEffect(() => {
    const container = document.querySelector(".community-container");
    const title = document.querySelector(".community-title");
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
    if (formSection) {
      gsap.from(formSection, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3,
      });
    }
  });

  onCleanup(() => {
    const container = document.querySelector(".community-container");
    const title = document.querySelector(".community-title");
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
    if (formSection) {
      gsap.to(formSection, {
        y: 100,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in",
        delay: 0.2,
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
        <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6 community-title">MindMate Community</h1>
        <div class="bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md p-6 community-container">
          <div class="form-section">
            <p class="text-gray-600 mb-4">
              Join our supportive community to share experiences, get advice, and connect with others on their mental health journey.
            </p>
            <div class="space-y-4 mb-6">
              <div class="p-4 bg-gradient-to-r from-rose-200 to-white rounded-md">
                <h3 class="text-lg font-medium text-gray-800">Tips for Staying Positive</h3>
                <p class="text-sm text-gray-600">Shared by Jane D. on July 5, 2025</p>
                <p class="text-sm text-gray-600">I've found that daily gratitude journaling really helps lift my mood!</p>
              </div>
              <div class="p-4 bg-gradient-to-r from-rose-200 to-white rounded-md">
                <h3 class="text-lg font-medium text-gray-800">Coping with Stress</h3>
                <p class="text-sm text-gray-600">Shared by Alex P. on July 3, 2025</p>
                <p class="text-sm text-gray-600">Deep breathing exercises have been a game-changer for me during tough days.</p>
              </div>
            </div>
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Join the Community</h2>
            {showSuccess() && (
              <div class="bg-green-100 border-l-4 border-green-600 p-4 mb-4 rounded-md flex items-center">
                <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p class="text-green-600">Welcome to the MindMate Community! You'll receive updates soon.</p>
              </div>
            )}
            <form onSubmit={handleJoin} class="space-y-6">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={email()}
                  onInput={(e) => setEmail(e.target.value)}
                  class={`mt-1 block w-full rounded-md border-2 ${
                    error() ? "border-rose-800" : "border-gray-300 focus:border-rose-700 focus:outline-none"
                  } focus:ring-rose-700 text-base p-2 transition-colors`}
                  required
                />
                {error() && <p class="text-rose-800 text-sm mt-1">Please enter a valid email</p>}
              </div>
              <button
                type="submit"
                class="bg-rose-700 text-white px-4 py-2 rounded-md hover:bg-rose-800 transition-colors text-base font-medium"
              >
                Join Now
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

export default Community;