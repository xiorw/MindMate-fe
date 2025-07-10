import { Component, createSignal, createEffect } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ActivitySuggestions: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [selectedActivity, setSelectedActivity] = createSignal(0);

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    // GSAP Animation for content
    const content = document.querySelector(".suggestions-content");
    if (content) {
      gsap.from(content, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }

    // GSAP Animation for activity cards
    const activityCards = document.querySelectorAll(".activity-card");
    activityCards.forEach((card, i) => {
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

    // GSAP Animation for suggestions preview
    const suggestionsPreview = document.querySelector(".suggestions-preview");
    if (suggestionsPreview) {
      ScrollTrigger.create({
        trigger: suggestionsPreview as HTMLElement,
        start: "top 85%",
        onEnter: () => {
          gsap.to(suggestionsPreview, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          });
          gsap.to(suggestionsPreview, {
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

    // Automatic activity switching
    const interval = setInterval(() => {
      setSelectedActivity((prev) => (prev + 1) % activities.length);
    }, 3000); // Switch every 3 seconds

    // Cleanup ScrollTriggers and interval on unmount
    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      clearInterval(interval);
    };
  });

  const activities = [
    { title: "Meditation", description: "A 5-minute mindfulness session to calm your mind.", icon: "🧘" },
    { title: "Guided Journaling", description: "Reflect with prompts to explore your emotions.", icon: "📝" },
    { title: "Affirmations", description: "Positive statements to boost your confidence.", icon: "🌟" },
    { title: "Short Exercise", description: "A quick workout to energize your body.", icon: "🏃" },
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
        <div class="max-w-7xl mx-auto text-center suggestions-content">
          <div class={`transition-all duration-1000 ${isVisible() ? "opacity-100" : "opacity-0"}`}>
            <div class="inline-flex items-center bg-yellow-200 text-gray-800 px-5 py-2.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <span class="mr-2">✨</span>
              Boost Your Mood
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-extrabold text-rose-700 mb-6 leading-tight tracking-tight">
              Activity Suggestions
            </h1>
            <p class="text-lg md:text-xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              The Activity Suggestions feature provides personalized recommendations to uplift your mood and promote well-being. Based on your logged emotions, receive tailored suggestions like light meditation, guided journaling, positive affirmations, or short physical exercises. Each activity is designed to be quick and accessible, helping you integrate positive habits into your daily routine. Explore a variety of activities and track their impact on your mood over time.
            </p>
            <div class="bg-white/70 rounded-2xl p-6 mb-6 backdrop-blur-sm max-w-3xl mx-auto suggestions-preview transition-transform hover:scale-105">
              <h4 class="font-semibold text-gray-800 text-lg mb-4">Explore Activities</h4>
              <div class="grid grid-cols-2 gap-4">
                {activities.map((activity, index) => (
                  <div
                    class={`activity-card p-4 rounded-lg border border-gray-200 transition-all duration-300 ${
                      selectedActivity() === index
                        ? "bg-gradient-to-r from-rose-100/30 to-white shadow-lg"
                        : "bg-white"
                    }`}
                    onClick={() => setSelectedActivity(index)}
                  >
                    <span class="text-2xl mb-2 block">{activity.icon}</span>
                    <h5 class="font-semibold text-gray-800 text-sm">{activity.title}</h5>
                    <p class="text-gray-600 text-xs">{activity.description}</p>
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

export default ActivitySuggestions;