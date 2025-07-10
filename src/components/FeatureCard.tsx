import { Component } from "solid-js";

interface Feature {
  icon: string;
  title: string;
  description: string;
  detail: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  activeFeature: number;
  onClick: () => void;
}

const FeatureCard: Component<FeatureCardProps> = (props) => {
  return (
    <div
      class={`feature-card p-6 rounded-2xl cursor-pointer transition-all duration-500 bg-white/50 backdrop-blur-md border border-rose-100/50 shadow-xl hover:shadow-2xl opacity-0 translate-y-10 ${
        props.activeFeature === props.index
          ? "bg-gradient-to-r from-rose-100 to-white border-rose-100 scale-105"
          : "hover:bg-white/70"
      }`}
      onClick={props.onClick}
    >
      <div class="flex items-start space-x-4">
        <div
          class={`text-4xl transition-transform duration-300 ${
            props.activeFeature === props.index ? "scale-110" : ""
          }`}
        >
          {props.feature.icon}
        </div>
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-gray-800 mb-2">{props.feature.title}</h3>
          <p class="text-gray-800 leading-relaxed">{props.feature.description}</p>
          {props.activeFeature === props.index && (
            <p class="text-rose-800 mt-3 font-medium">{props.feature.detail}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeatureCard;