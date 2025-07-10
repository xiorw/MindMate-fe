import { Component, createSignal, createEffect } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const MoodTracker: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [selectedMood, setSelectedMood] = createSignal(3); // Default mood level

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    // GSAP Animation for content
    const content = document.querySelector(".mood-tracker-content");
    if (content) {
      gsap.from(content, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }

    // GSAP Animation for mood selector
    const moodCircles = document.querySelectorAll(".mood-circle");
    moodCircles.forEach((circle, i) => {
      if (circle) {
        ScrollTrigger.create({
          trigger: circle as HTMLElement,
          start: "top 85%",
          onEnter: () => {
            gsap.to(circle, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: i * 0.1,
              ease: "power3.out",
            });
          },
        });
      }
    });

    // GSAP Animation for mood preview
    const moodPreview = document.querySelector(".mood-preview");
    if (moodPreview) {
      ScrollTrigger.create({
        trigger: moodPreview as HTMLElement,
        start: "top 85%",
        onEnter: () => {
          gsap.to(moodPreview, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          });
          gsap.to(moodPreview, {
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

    // Cleanup ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  });

  const moods = [
    { emoji: "😢", label: "Very Sad", color: "bg-white", textColor: "text-red-600", value: 1 },
    { emoji: "😔", label: "Sad", color: "bg-white", textColor: "text-orange-600", value: 2 },
    { emoji: "😐", label: "Neutral", color: "bg-white", textColor: "text-yellow-600", value: 3 },
    { emoji: "😊", label: "Happy", color: "bg-white", textColor: "text-lime-600", value: 4 },
    { emoji: "😄", label: "Very Happy", color: "bg-white", textColor: "text-green-600", value: 5 },
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
        <div class="max-w-7xl mx-auto text-center mood-tracker-content">
          <div class={`transition-all duration-1000 ${isVisible() ? "opacity-100" : "opacity-0"}`}>
            <div class="inline-flex items-center bg-yellow-200 text-gray-800 px-5 py-2.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <span class="mr-2">✨</span>
              Understand Your Emotions
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-extrabold text-rose-900 mb-6 leading-tight tracking-tight">
              Mood Tracker
            </h1>
            <p class="text-lg md:text-xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              The Mood Tracker feature allows you to log your daily emotions using a simple emoji-based system or a color-coded scale. Choose from a range of moods, from sad to excited, and add optional notes to describe what influenced your feelings. Over time, you can view a detailed history of your moods, displayed in an intuitive timeline or calendar format, helping you identify patterns and triggers. Whether you're feeling low or elated, tracking your mood daily provides valuable insights to support your mental health journey.
            </p>
            <div class="bg-white border border-rose-200 rounded-lg p-6 mb-6 max-w-md mx-auto shadow-lg mood-preview transition-transform hover:scale-105">
              <h4 class="font-semibold text-gray-800 text-lg mb-4">Try Selecting a Mood</h4>
              <div class="flex justify-center space-x-4 mb-4">
                {moods.map((mood, index) => (
                  <button
                    class={`mood-circle w-12 h-12 rounded-full flex items-center justify-center transform transition-transform duration-200 hover:scale-125 hover:shadow-lg focus:ring-4 focus:ring-rose-200 ${mood.color} ${
                      selectedMood() === mood.value ? "shadow-lg border-2 border-rose-700" : ""
                    }`}
                    onClick={() => setSelectedMood(mood.value)}
                    title={mood.label}
                  >
                    <span class={`text-2xl ${mood.textColor}`}>{mood.emoji}</span>
                  </button>
                ))}
              </div>
              <p class="text-gray-800 text-sm leading-relaxed">
                Current Mood: <span class={`font-semibold ${moods[selectedMood() - 1]?.textColor}`}>{moods[selectedMood() - 1]?.label}</span>
              </p>
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

export default MoodTracker;