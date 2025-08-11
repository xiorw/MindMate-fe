import { Component } from "solid-js";
import { useNavigate } from "@solidjs/router";

const Footer: Component = () => {
  const navigate = useNavigate();

  // Navigation handlers for Features and Support
  const handleFeatureClick = (feature: string) => {
    switch (feature) {
      case "Mood Tracker":
        navigate("/mood-tracker");
        break;
      case "Daily Journal":
        navigate("/daily-journal");
        break;
      case "Personal Stats":
        navigate("/personal-stats");
        break;
      case "Activity Suggestions":
        navigate("/activity-suggestions");
        break;
      case "Help Center":
        navigate("/help");
        break;
      case "Contact a Psychologist":
        navigate("/contact-psychologist");
        break;
      case "Privacy Policy":
        navigate("/privacy");
        break;
    }
  };

  return (
    <footer class="bg-rose-900 text-white py-10 px-4 sm:px-6 lg:px-8">
      <div class="max-w-7xl mx-auto">
        <div class="grid md:grid-cols-4 gap-8">
          <div>
            <div class="flex items-center space-x-3 mb-4">
              <div class="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
                <span class="text-rose-800 font-bold text-xl">M</span>
              </div>
              <span class="text-2xl font-bold tracking-tight">MindMate</span>
            </div>
            <p class="text-rose-200 text-sm leading-relaxed">
              Supporting your mental health journey with caring technology.
            </p>
          </div>

          <div>
            <h4 class="font-semibold text-lg mb-4">Features</h4>
            <ul class="space-y-3 text-rose-200 text-sm">
              {["Mood Tracker", "Daily Journal", "Personal Stats", "Activity Suggestions"].map((feature) => (
                <li
                  class="hover:text-yellow-400 transition-colors cursor-pointer"
                  onClick={() => handleFeatureClick(feature)}
                >
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-lg mb-4">Support</h4>
            <ul class="space-y-3 text-rose-200 text-sm">
              {["Help Center", "Contact a Psychologist", "Privacy Policy"].map((support) => (
                <li
                  class="hover:text-yellow-400 transition-colors cursor-pointer"
                  onClick={() => handleFeatureClick(support)}
                >
                  {support}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-lg mb-4">Contact</h4>
            <ul class="space-y-3 text-rose-200 text-sm">
              <li class="hover:text-yellow-400 transition-colors cursor-pointer">
                <a href="https://mail.google.com/mail/?view=cm&fs=1&to=mindmate.id@gmail.com" target="_blank">mindmate.id@gmail.com</a> 
              </li>
              <li class="hover:text-yellow-400 transition-colors cursor-pointer">
                <a href="https://wa.me/6281575279212?text=Halo%2C%20saya%20ingin%20bertanya">+62 815 7527 9212</a> 
              </li>
              <li class="hover:text-yellow-400 transition-colors cursor-pointer">
                <a href="https://www.google.com/maps/search/Purwokerto,+Indonesia" target="_blank" rel="noopener noreferrer">
                  Purwokerto, Indonesia
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div class="border-t border-white/50 mt-6 pt-4 text-center text-rose-200 text-sm">
          <p>
            © 2025 MindMate. All rights reserved. Made with ❤️ for better mental health.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;