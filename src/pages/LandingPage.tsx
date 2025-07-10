import { Component, createSignal, createEffect } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Button from "../components/Button";
import FeatureCard from "../components/FeatureCard";
import TestimonialCard from "../components/TestimonialCard";

gsap.registerPlugin(ScrollTrigger);

const LandingPage: Component = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = createSignal(false);
  const [activeFeature, setActiveFeature] = createSignal(0);
  const [currentSlogan, setCurrentSlogan] = createSignal(0);

  createEffect(() => {
    setTimeout(() => setIsVisible(true), 100);

    // Auto-rotate features
    const featureInterval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 3);
    }, 4000);

    // Auto-rotate slogans
    const sloganInterval = setInterval(() => {
      setCurrentSlogan((prev) => (prev + 1) % slogans.length);
    }, 3000);

    // GSAP Animations
    const heroContent = document.querySelector(".hero-content");
    if (heroContent) {
      gsap.from(heroContent, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
      });
    }

    const featureCards = document.querySelectorAll(".feature-card");
    featureCards.forEach((card, i) => {
      if (card) {
        ScrollTrigger.create({
          trigger: card as HTMLElement,
          start: "top 80%",
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

    const testimonialCards = document.querySelectorAll(".testimonial-card");
    testimonialCards.forEach((card, i) => {
      if (card) {
        ScrollTrigger.create({
          trigger: card as HTMLElement,
          start: "top 85%",
          onEnter: () => {
            gsap.to(card, {
              y: 0,
              opacity: 1,
              duration: 0.8,
              delay: i * 0.15,
              ease: "power3.out",
            });
          },
        });
      }
    });

    // Cleanup intervals on component unmount
    return () => {
      clearInterval(featureInterval);
      clearInterval(sloganInterval);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  });

  const features = [
    {
      icon: "💭",
      title: "Mood Tracker",
      description: "Record your daily mood with ease",
      detail: "Track mood changes and discover emotional patterns",
    },
    {
      icon: "📝",
      title: "Daily Journal",
      description: "Write reflections and express yourself",
      detail: "A safe space to pour out your thoughts and feelings",
    },
    {
      icon: "🎯",
      title: "Personalized Suggestions",
      description: "Activities tailored to your condition",
      detail: "Meditation, exercise, and other positive habits",
    },
  ];

  const slogans = [
    "Mental health is a priority, not a luxury",
    "Every small step toward a better you",
    "Understanding yourself is the key to true happiness",
    "Your mental health journey starts today",
    "You're not alone in this journey",
    "Healthy mind, more meaningful life",
  ];

  const testimonials = [
    {
      name: "Sarah, 22",
      role: "Student",
      text: "MindMate helped me understand my mood patterns and manage college stress better.",
    },
    {
      name: "Rizki, 26",
      role: "Worker",
      text: "The journaling feature really helps me reflect after a tiring day.",
    },
    {
      name: "Maya, 19",
      role: "High School Student",
      text: "The activity suggestions are always spot-on and make my days feel more positive!",
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

      {/* Hero Section */}
      <section class="pt-28 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="max-w-7xl mx-auto text-center hero-content">
          <div class={`transition-all duration-1000 ${isVisible() ? "opacity-100" : "opacity-0"}`}>
            <div class="inline-flex items-center bg-yellow-200 text-gray-800 px-5 py-2.5 rounded-full text-sm font-medium mb-6 shadow-sm">
              <span class="mr-2">✨</span>
              Mental health for the digital generation
            </div>
            <h1 class="text-4xl sm:text-5xl text-rose-700 md:text-7xl font-extrabold text-gray-800 mb-6 leading-tight tracking-tight">
              Track Your
              <span class="block bg-rose-900 bg-clip-text text-transparent">
                Mental Health
              </span>
            </h1>
            <p class="text-lg md:text-xl text-gray-800 mb-8 max-w-3xl mx-auto leading-relaxed">
              MindMate is a platform that helps you understand and manage your mental health in a
              fun, easy, and personalized way.
            </p>
            <div class="flex justify-center">
              <Button onClick={() => navigate("/login")} class="rose-800">
                Get Started
                <svg
                  class="w-6 h-6 group-hover:translate-x-1.5 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-xl">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">
              Features to Support Your Journey
            </h2>
            <p class="text-lg text-gray-800 max-w-3xl mx-auto leading-relaxed">
              Each feature is carefully designed to help you better understand yourself
            </p>
          </div>
          <div class="grid lg:grid-cols-2 gap-8 items-center">
            <div class="space-y-6">
              {features.map((feature, index) => (
                <FeatureCard
                  feature={feature}
                  index={index}
                  activeFeature={activeFeature()}
                  onClick={() => setActiveFeature(index)}
                />
              ))}
            </div>
            <div class="relative">
              <div class="bg-gradient-to-br from-rose-100 to-white rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
                <div class="bg-white rounded-2xl p-6 mb-6 backdrop-blur-sm">
                  <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold text-gray-800 text-lg">Today's Mood</h4>
                    <span class="text-3xl animate-pulse">😊</span>
                  </div>
                  <div class="flex space-x-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        class={`w-8 h-8 rounded-full transition-all duration-300 ${
                          i < 4 ? "bg-rose-800" : "bg-gray-800/20"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div class="bg-white rounded-2xl p-6 backdrop-blur-sm">
                  <h4 class="font-semibold text-gray-800 text-lg mb-2">Today's Journal</h4>
                  <p class="text-gray-800 text-sm leading-relaxed">
                    "Today felt better than yesterday. I managed to finish my tasks and felt
                    calmer..."
                  </p>
                </div>
              </div>
              <div class="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center shadow-xl backdrop-blur-sm animate-bounce-slow">
                <span class="text-3xl">✨</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan Carousel Section */}
      <section class="py-24 px-4 sm:px-6 lg:px-8 bg-rose-900 relative">
        <div class="max-w-5xl mx-auto text-center">
          <div class="relative h-28 flex items-center justify-center">
            <div class="absolute inset-0 flex items-center justify-center">
              <h3 class="text-3xl md:text-4xl font-extrabold text-white transition-all duration-700 ease-in-out transform">
                {slogans[currentSlogan()]}
              </h3>
            </div>
          </div>
          <div class="flex justify-center space-x-3 mt-10">
            {slogans.map((_, index) => (
              <button
                class={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlogan() === index
                    ? "bg-white scale-150 shadow-lg"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                onClick={() => setCurrentSlogan(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section class="py-20 px-4 sm:px-6 lg:px-8 bg-white/80 backdrop-blur-xl">
        <div class="max-w-7xl mx-auto">
          <div class="text-center mb-16">
            <h2 class="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 tracking-tight">
              What Do They Say?
            </h2>
            <p class="text-lg text-gray-800 max-w-2xl mx-auto leading-relaxed">
              Real experiences from MindMate users
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard testimonial={testimonial} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section class="py-24 px-4 sm:px-6 lg:px-8 bg-rose-800 relative">
        <div class="max-w-5xl mx-auto text-center text-white">
          <h2 class="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Ready to Begin Your
            <span class="block bg-yellow-200 bg-clip-text text-transparent">
              Mental Health Journey?
            </span>
          </h2>
          <p class="text-xl text-white mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of users already benefiting from MindMate for a more balanced and happier
            life.
          </p>
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
            opacity: 0.5;
          }
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          .animate-bounce-slow {
            animation: bounce-slow 3s infinite ease-in-out;
          }
        `}
      </style>
    </div>
  );
};

export default LandingPage;