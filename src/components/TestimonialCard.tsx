import { Component } from "solid-js";

interface Testimonial {
  name: string;
  role: string;
  text: string;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  index: number;
}

const TestimonialCard: Component<TestimonialCardProps> = (props) => {
  return (
    <div class="testimonial-card bg-white/50 p-6 rounded-2xl border border-rose-100/50 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 opacity-0 translate-y-10">
      <div class="flex mb-4">
        {[...Array(5)].map(() => (
          <svg class="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
      <p class="text-gray-800 mb-4 italic text-sm leading-relaxed">{`"${props.testimonial.text}"`}</p>
      <div class="flex items-center">
        <div class="w-12 h-12 bg-gradient-to-r from-rose-600 to-rose-800 rounded-full flex items-center justify-center mr-3 shadow-md">
          <span class="text-white font-semibold text-lg">{props.testimonial.name[0]}</span>
        </div>
        <div>
          <div class="font-semibold text-gray-800">{props.testimonial.name}</div>
          <div class="text-gray-800 text-sm">{props.testimonial.role}</div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;