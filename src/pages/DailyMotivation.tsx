import { Component, createSignal, createEffect } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DailyMotivation: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [selectedMotivation, setSelectedMotivation] = createSignal(0);

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    // GSAP Animation for content
    const content = document.querySelector(".motivation-content");
    if (content) {
      gsap.from(content, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }

    // GSAP Animation for motivation cards
    const motivationCards = document.querySelectorAll(".motivation-card");
    motivationCards.forEach((card, i) => {
      if (card) {
        ScrollTrigger.create({
          trigger: card as HTMLElement,
          start: "top 85%",
          onEnter: () => {
            gsap.to(card, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: i * 0.2,
              ease: "power3.out",
            });
          },
        });
      }
    });

    // GSAP Animation for motivation preview
    const motivationPreview = document.querySelector(".motivation-preview");
    if (motivationPreview) {
      ScrollTrigger.create({
        trigger: motivationPreview as HTMLElement,
        start: "top 85%",
        onEnter: () => {
          gsap.to(motivationPreview, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          });
          gsap.to(motivationPreview, {
            boxShadow: "0 0 10px rgba(251, 113, 133, 0.5)",
            duration: 1,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
            delay: 0.8,
          });
        },
      });
    }

    // Automatic motivation switching
    const interval = setInterval(() => {
      setSelectedMotivation((prev) => (prev + 1) % motivations.length);
    }, 3000); // Switch every 3 seconds

    // Cleanup ScrollTriggers and interval on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      clearInterval(interval);
    };
  });

  const motivations = [
    { 
      date: "August 15, 2025", 
      quote: "The future belongs to those who believe in the beauty of their dreams.", 
      author: "Eleanor Roosevelt",
      icon: "🌟" 
    },
    { 
      date: "August 16, 2025", 
      quote: "Success is not the key to happiness. Happiness is the key to success.", 
      author: "Albert Schweitzer",
      icon: "🌈" 
    },
    { 
      date: "August 17, 2025", 
      quote: "Don't wait for opportunity. Create it.", 
      author: "George Bernard Shaw",
      icon: "⚡" 
    },
    { 
      date: "August 18, 2025", 
      quote: "Believe in yourself and all that you are.", 
      author: "Christian D. Larson",
      icon: "💪" 
    },
  ];

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-100 to-rose-100 relative overflow-hidden">
      {/* Parallax Background with Bubbles */}
      <div class="absolute inset-0">
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

      {/* Main Section */}
      <section class="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-7xl mx-auto text-center motivation-content">
          <div class={`transition-all duration-1000 ${isVisible() ? "opacity-100" : "opacity-0"}`}>
            <div class="inline-flex items-center bg-yellow-200 text-gray-800 px-5 py-2.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <span class="mr-2">✨</span>
              Daily Inspiration
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-extrabold text-rose-700 mb-6 leading-tight tracking-tight">
              Daily Motivation
            </h1>
            <p class="text-lg md:text-xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              The Daily Motivation feature provides daily inspiration through motivational quotes from famous world figures. Each day, you will receive a new quote that can help start your day with positive energy. These quotes are specially selected to provide motivation, inspiration, and fresh perspectives in facing daily challenges. Let's start your day with the right dose of motivation!
            </p>
            <div class="bg-white/70 rounded-2xl p-6 mb-6 backdrop-blur-sm max-w-4xl mx-auto motivation-preview transition-transform hover:scale-105">
              <h4 class="font-semibold text-gray-800 text-lg mb-4">Daily Motivational Quotes</h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {motivations.map((motivation, index) => (
                  <div
                    class={`motivation-card p-6 rounded-lg border border-gray-200 transition-all duration-300 ${
                      selectedMotivation() === index
                        ? "bg-gradient-to-r from-rose-100/30 to-white shadow-lg transform scale-105"
                        : "bg-white"
                    }`}
                    onClick={() => setSelectedMotivation(index)}
                  >
                    <div class="flex items-center justify-between mb-3">
                      <span class="text-2xl">{motivation.icon}</span>
                      <span class="text-sm text-gray-500 font-medium">{motivation.date}</span>
                    </div>
                    <blockquote class="text-gray-800 text-sm md:text-base italic mb-3 leading-relaxed">
                      "{motivation.quote}"
                    </blockquote>
                    <cite class="text-rose-600 text-sm font-semibold not-italic">
                      — {motivation.author}
                    </cite>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Custom CSS for Animations */}
      <style>
        {`
          @keyframes bubble {
            0% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(${Math.random() * 50 - 25}vw, ${Math.random() * 50 - 25}vh) scale(1.2); }
            100% { transform: translate(0, 0) scale(1); }
          }
          .animate-bubble {
            animation: bubble 10s infinite ease-in-out;
            opacity: 0.3;
          }
        `}
      </style>
    </div>
  );
};

export default DailyMotivation;