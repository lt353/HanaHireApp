import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "success";
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = "primary", 
  className = "", 
  ...props 
}) => {
  const variants = {
    primary: "bg-[#1A7A84] text-white hover:bg-[#1A7A84]/90",
    secondary: "bg-[#D25B3A] text-white hover:bg-[#D25B3A]/90",
    outline: "border-2 border-gray-200 text-gray-700 hover:border-[#1A7A84] hover:text-[#1A7A84]",
    ghost: "text-gray-700 hover:bg-gray-100",
    success: "bg-[#1A7A84] text-white hover:bg-[#1A7A84]/90",
  };
  
  return (
    <button 
className={`px-6 py-3 rounded-2xl font-black transition-all active:scale-95 inline-flex items-center justify-center gap-2 text-sm uppercase whitespace-nowrap tracking-wide sm:tracking-widest ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};