import { Component, createSignal, createEffect, onCleanup } from "solid-js";
import { gsap } from "gsap";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_70v41ij";
const TEMPLATE_ID = "template_kp4ntk7";
const PUBLIC_KEY = "RckdfFzbSyyuZgKXP";

const ContactPsychologist: Component = () => {
  const [formData, setFormData] = createSignal({ name: "", email: "", preferredDate: "", message: "" });
  const [errors, setErrors] = createSignal({ name: false, email: false, preferredDate: false });
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false); // Added loading state

  const handleInputChange = (e: Event) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    setFormData({ ...formData(), [target.name]: target.value });
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
      preferredDate: formData().preferredDate.trim() === "",
    };
    setErrors(newErrors);

    if (!newErrors.name && !newErrors.email && !newErrors.preferredDate) {
      setIsLoading(true); // Set loading state to true
      emailjs
        .send(
          SERVICE_ID,
          TEMPLATE_ID,
          {
            from_name: formData().name,
            from_email: formData().email,
            preferred_date: formData().preferredDate,
            message: formData().message,
            to_email: "placeholder@example.com",
          },
          PUBLIC_KEY
        )
        .then(() => {
          setShowSuccess(true);
          setFormData({ name: "", email: "", preferredDate: "", message: "" });
          setTimeout(() => setShowSuccess(false), 3000);
        })
        .catch((error) => {
          console.error("EmailJS Error:", error);
        })
        .finally(() => {
          setIsLoading(false); // Reset loading state
        });
    }
  };

  createEffect(() => {
    const container = document.querySelector(".psychologist-container");
    const title = document.querySelector(".psychologist-title");
    const formSection = document.querySelector(".form-section");

    if (container) {
      gsap.from(container, {
        y: 100,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out",
        delay: 0,
      });
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
    const container = document.querySelector(".psychologist-container");
    const title = document.querySelector(".psychologist-title");
    const formSection = document.querySelector(".form-section");

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
    { left: '5%', top: '10%' },
    { left: '10%', top: '30%' },
    { left: '15%', top: '50%' },
    { left: '20%', top: '70%' },
    { left: '10%', top: '90%' },
    { left: '85%', top: '15%' },
    { left: '90%', top: '35%' },
    { left: '95%', top: '55%' },
    { left: '80%', top: '75%' },
    { left: '85%', top: '95%' },
    { left: '50%', top: '20%' },
    { left: '50%', top: '80%' },
  ];

  return (
    <div class="min-h-screen bg-gradient-to-br from-rose-100 to-rose-100 relative overflow-hidden">
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

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <h1 class="text-3xl md:text-4xl font-bold text-rose-700 mb-6 psychologist-title">Contact a Psychologist</h1>
        <div class="bg-white/70 border border-rose-200 rounded-lg shadow-lg backdrop-blur-md p-6 psychologist-container">
          <div class="form-section">
            <p class="text-gray-600 mb-4">
              Connect with a licensed psychologist to discuss your mental health needs. Fill out the form below to schedule a consultation.
            </p>
            {showSuccess() && (
              <div class="bg-green-100 border-l-4 border-green-600 p-4 mb-4 rounded-md flex items-center">
                <svg class="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <p class="text-green-600">Your request has been submitted! We'll confirm your appointment soon.</p>
              </div>
            )}
            <form onSubmit={handleSubmit} class="space-y-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Complete Name</label>
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
                <label for="preferredDate" class="block text-sm font-medium text-gray-700">Preferred Date</label>
                <input
                  type="date"
                  name="preferredDate"
                  value={formData().preferredDate}
                  onInput={handleInputChange}
                  class={`mt-1 block w-full rounded-md border-2 ${
                    errors().preferredDate ? "border-rose-800" : "border-gray-300 focus:border-rose-700 focus:outline-none"
                  } focus:ring-rose-700 text-base p-2 transition-colors`}
                  required
                />
              </div>
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700">Additional Notes</label>
                <textarea
                  name="message"
                  value={formData().message}
                  onInput={handleInputChange}
                  class="mt-1 block w-full rounded-md border-2 border-gray-300 focus:border-rose-700 focus:outline-none focus:ring-rose-700 text-base p-2 transition-colors"
                  rows={6}
                ></textarea>
              </div>
              <button
                type="submit"
                class={`bg-rose-700 text-white px-4 py-2 rounded-md hover:bg-rose-800 transition-colors text-base font-medium flex items-center justify-center ${
                  isLoading() ? "opacity-75 cursor-not-allowed" : ""
                }`}
                disabled={isLoading()}
              >
                {isLoading() ? (
                  <>
                    <svg
                      class="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  "Request Consultation"
                )}
              </button>
            </form>
          </div>
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
          .animate-bubble { animation: bubble 6s ease-in-out infinite; opacity: 0.5; }
          .animate-bubble-slow { animation: bubble-slow 9s ease-in-out infinite; opacity: 0.5; }
          .animate-bubble-fast { animation: bubble-fast 3s ease-in-out infinite; opacity: 0.5; }
        `}
      </style>
    </div>
  );
};

export default ContactPsychologist;