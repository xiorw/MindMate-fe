import { Component, createEffect, onCleanup } from "solid-js";
import { gsap } from "gsap";

const PrivacyPolicy: Component = () => {
  createEffect(() => {
    const container = document.querySelector(".privacy-container");
    const title = document.querySelector(".privacy-title");
    const contentSection = document.querySelector(".content-section");

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
    if (contentSection) {
      gsap.from(contentSection, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0.3,
      });
    }
  });

  onCleanup(() => {
    const container = document.querySelector(".privacy-container");
    const title = document.querySelector(".privacy-title");
    const contentSection = document.querySelector(".content-section");

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
    if (contentSection) {
      gsap.to(contentSection, {
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
        <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6 privacy-title">Privacy Policy</h1>
        <div class="bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md p-6 privacy-container">
          <div class="content-section">
            <h2 class="text-2xl font-semibold text-gray-900 mb-4">Our Commitment to Your Privacy</h2>
            <p class="text-gray-600 mb-4">
              At MindMate, we value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
            </p>
            <div class="space-y-4">
              <div class="bg-gradient-to-r from-rose-200 to-white p-4 rounded-md">
                <h3 class="text-lg font-medium text-gray-800">Information We Collect</h3>
                <p class="text-sm text-gray-600">
                  We collect information you provide, such as your name, email, and mood data, to personalize your experience and improve our services.
                </p>
              </div>
              <div class="bg-gradient-to-r from-rose-200 to-white p-4 rounded-md">
                <h3 class="text-lg font-medium text-gray-800">How We Use Your Information</h3>
                <p class="text-sm text-gray-600">
                  Your data is used to provide features like mood tracking and journal entries, and to send you relevant updates or activity suggestions.
                </p>
              </div>
              <div class="bg-gradient-to-r from-rose-200 to-white p-4 rounded-md">
                <h3 class="text-lg font-medium text-gray-800">Data Security</h3>
                <p class="text-sm text-gray-600">
                  We implement industry-standard security measures to protect your data from unauthorized access or disclosure.
                </p>
              </div>
              <div class="bg-gradient-to-r from-rose-200 to-white p-4 rounded-md">
                <h3 class="text-lg font-medium text-grayquiz-800">Your Rights</h3>
                <p class="text-sm text-gray-600">
                  You can access, update, or delete your data at any time through your account settings or by contacting us at <a href="mailto:support@mindmate.app" class="text-rose-700 hover:underline">support@mindmate.app</a>.
                </p>
              </div>
              <div class="bg-gradient-to-r from-rose-200 to-white p-4 rounded-md">
                <h3 class="text-lg font-medium text-gray-800">Contact Us</h3>
                <p class="text-sm text-gray-600">
                  For any privacy-related questions, reach out to us at <a href="mailto:support@mindmate.app" class="text-rose-700 hover:underline">support@mindmate.app</a>.
                </p>
              </div>
            </div>
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
            50% { transform: translateY(-30px) translateX(-15px) scale noises(0.9) rotate(-8deg); }
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

export default PrivacyPolicy;