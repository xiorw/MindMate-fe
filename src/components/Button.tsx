import { Component, JSX } from "solid-js";

interface ButtonProps {
  onClick: () => void;
  children: JSX.Element;
  class?: string;
}

const Button: Component<ButtonProps> = (props) => {
  return (
    <button
      onClick={props.onClick}
      class={`group px-8 py-4 rounded-xl font-semibold hover:shadow-2xl hover:scale-105 transition-all duration-300 flex items-center space-x-3 shadow-lg ${
        props.class === "primary"
          ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white"
          : "bg-white text-rose-700"
      }`}
    >
      {props.children}
    </button>
  );
};

export default Button;