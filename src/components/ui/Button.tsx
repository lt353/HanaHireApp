import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success" | "dark";
  size?: string;
  className?: string;
}

export function buttonVariants({ variant = "primary", className = "" }: { variant?: ButtonProps["variant"]; size?: string; className?: string } = {}) {
  const variants = {
    primary: "bg-[#148F8B] text-white hover:bg-[#A63F8E]",
    secondary: "bg-[#A63F8E] text-white hover:bg-[#148F8B]",
    outline:
      "border-2 border-gray-200 bg-white text-gray-700 hover:bg-[#EBE1E6]",
    ghost: "text-gray-700 hover:bg-gray-100",
    success: "bg-[#148F8B] text-white hover:bg-[#A63F8E]",
    dark: "bg-gray-700 text-white hover:bg-gray-800",
  };
  return `px-6 py-3 rounded-2xl font-black transition-all active:scale-95 inline-flex items-center justify-center gap-2 text-sm uppercase whitespace-nowrap tracking-wide sm:tracking-widest ${variants[variant!]} ${className}`;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  className = "", 
  style,
  ...props 
}) => {
  const variants = {
    primary: "bg-[#148F8B] text-white hover:bg-[#A63F8E]",
    secondary: "bg-[#A63F8E] text-white hover:bg-[#148F8B]",
    outline:
      "border-2 border-gray-200 bg-white text-gray-700 hover:bg-[#EBE1E6]",
    ghost: "text-gray-700 hover:bg-gray-100",
    success: "bg-[#148F8B] text-white hover:bg-[#A63F8E]",
    dark: "bg-gray-700 text-white hover:bg-gray-800",
  };

  const variantStyle = style;
  
  return (
    <button 
      className={`px-6 py-3 rounded-2xl font-black transition-all active:scale-95 inline-flex items-center justify-center gap-2 text-sm uppercase whitespace-nowrap tracking-wide sm:tracking-widest ${variants[variant]} ${className}`}
      style={variantStyle}
      {...props}
    >
      {children}
    </button>
  );
};