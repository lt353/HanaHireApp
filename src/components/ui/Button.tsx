import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success" | "dark";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  className = "", 
  style,
  ...props 
}) => {
  const variants = {
    primary: "bg-[#148F8B] text-white hover:bg-[#148F8B]/90",
    secondary: "text-white",
    outline: "border-2 border-gray-200 text-gray-700 hover:border-[#148F8B] hover:text-[#148F8B]",
    ghost: "text-gray-700 hover:bg-gray-100",
    success: "bg-[#148F8B] text-white hover:bg-[#148F8B]/90",
    dark: "bg-gray-700 text-white hover:bg-gray-800",
  };

  const variantStyle = variant === "secondary"
    ? { backgroundColor: "#A63F8E", ...style }
    : style;
  
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