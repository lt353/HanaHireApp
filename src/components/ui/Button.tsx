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
    primary: "bg-[#0077BE] text-white hover:bg-[#005a91]",
    secondary: "bg-[#FF6B6B] text-white hover:bg-[#e85a5a]",
    outline: "border-2 border-gray-200 text-gray-700 hover:border-[#0077BE] hover:text-[#0077BE]",
    ghost: "text-gray-500 hover:bg-gray-100",
    success: "bg-[#2ECC71] text-white hover:bg-[#27ae60]",
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