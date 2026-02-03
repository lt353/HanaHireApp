import React from "react";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import heroImg from "figma:asset/91ba38fb159ccc8ce965117ab3cccd2035e23570.png";

interface HomeProps {
  onSelectRole: (role: 'seeker' | 'employer') => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectRole }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="py-24 px-4 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-10 text-center lg:text-left">
          <div className="space-y-6">
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">Hire the <span className="text-[#0077BE]">Person</span>,
Not the Paper</h1>
            <p className="text-2xl md:text-4xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Job seekers show who they are in seconds. Employers see real people, not paper. Everyone saves time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start pt-6">
            <button 
              onClick={() => onSelectRole("seeker")} 
className="flex-1 bg-[#0077BE] text-white py-4 px-4 sm:py-5 sm:px-8 rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-[#0077BE]/20 font-black text-lg tracking-tight uppercase whitespace-nowrap"
            >
              Looking for a job
            </button>
            <button 
              onClick={() => onSelectRole("employer")} 
className="flex-1 bg-[#2ECC71] text-white py-4 px-4 sm:py-5 sm:px-8 rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-[#2ECC71]/20 font-black text-lg tracking-tight uppercase whitespace-nowrap"
            >
              Looking to hire
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-[#0077BE]/10 rounded-[5rem] blur-3xl"></div>
          <div className="relative rounded-[4rem] overflow-hidden shadow-[0_48px_96px_-24px_rgba(0,0,0,0.2)] aspect-square border-8 border-white bg-gray-100">
            <ImageWithFallback src={heroImg} alt="Job Seeker Filming" className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </section>
    </motion.div>
  );
};