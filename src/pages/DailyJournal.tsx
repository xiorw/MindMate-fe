import { Component, createSignal, createEffect } from "solid-js";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const DailyJournal: Component = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  const [previewText, setPreviewText] = createSignal("");

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    const content = document.querySelector(".journal-content");
    if (content) {
      gsap.from(content, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }

    const journalPreview = document.querySelector(".journal-preview");
    if (journalPreview) {
      ScrollTrigger.create({
        trigger: journalPreview as HTMLElement,
        start: "top 85%",
        onEnter: () => {
          gsap.to(journalPreview, {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          });

          const text = "Today felt better than yesterday...";
          gsap.to({ chars: "" }, {
            chars: text,
            duration: text.length * 0.05,
            ease: "none",
            onUpdate: function () {
              setPreviewText(this.targets()[0].chars);
              const chars = document.querySelectorAll(".journal-preview .char");
              chars.forEach((char, i) => {
                gsap.fromTo(
                  char,
                  { opacity: 0, y: 5 },
                  {
                    opacity: 1,
                    y: 0,
                    duration: 0.2,
                    delay: i * 0.05,
                    ease: "power2.out",
                  }
                );
              });
            },
            onComplete: () => {
              gsap.to(journalPreview, {
                boxShadow: "0 0 10px rgba(251, 113, 133, 0.5)",
                duration: 1,
                yoyo: true,
                repeat: -1,
                ease: "sine.inOut",
              });
            },
          });
        },
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  });

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
        <div class="max-w-7xl mx-auto text-center journal-content">
          <div class={`transition-all duration-1000 ${isVisible() ? "opacity-100" : "opacity-0"}`}>
            <div class="inline-flex items-center bg-yellow-200 text-gray-800 px-5 py-2.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <span class="mr-2">✨</span>
              Reflect on Your Day
            </div>
            <h1 class="text-4xl sm:text-5xl md:text-7xl font-extrabold text-rose-700 mb-6 leading-tight tracking-tight">
              Daily Journal
            </h1>
            <p class="text-lg md:text-xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              The Daily Journal feature provides a private, secure space to document your thoughts, feelings, and experiences each day. Write freely or use guided prompts to explore your emotions, set goals, or reflect on meaningful moments. Your entries are stored securely and can be revisited to track your personal growth over time. With features like tagging and search, you can easily organize and find past entries to reflect on your journey.
            </p>
            <div class="bg-white/70 rounded-2xl p-6 mb-6 backdrop-blur-sm max-w-md mx-auto journal-preview transition-transform hover:scale-105">
              <h4 class="font-semibold text-gray-800 text-lg mb-4">Journal Preview</h4>
              <div
                class="w-full p-3 border-2 border-rose-700 rounded-lg text-gray-800 text-sm h-24 overflow-hidden relative"
                style="white-space: pre-wrap;"
              >
                {previewText()
                  .split("")
                  .map((char, i) => (
                    <span class="char inline-block" style="white-space: pre">
                      {char === " " ? "\u00A0" : char}
                    </span>
                  ))}
                <span class="animate-cursor">|</span>
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
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          .animate-cursor {
            animation: blink 0.7s infinite;
            font-weight: bold;
          }
          .journal-preview {
            transition: transform 0.3s ease-in-out;
          }
          .char {
            letter-spacing: 0.03em;
          }
        `}
      </style>
    </div>
  );
};

export default DailyJournal;
