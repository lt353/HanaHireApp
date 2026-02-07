import React, { useEffect } from "react";
import { Video, Search, DollarSign, CheckCircle, Sparkles, Clock, Shield, Users } from "lucide-react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { INTERACTION_FEE } from "../../data/mockData";
import heroImg from "../../assets/hero-image.jpg";

interface HomeProps {
  onSelectRole: (role: 'seeker' | 'employer') => void;
}

export const Home: React.FC<HomeProps> = ({ onSelectRole }) => {
  // Preload hero image for faster loading
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroImg;
    link.setAttribute('fetchpriority', 'high');
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="py-12 sm:py-24 px-4 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-16 items-center">
        <div className="space-y-6 sm:space-y-10 text-center lg:text-left">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-none">
              Hire the <span className="text-[#0077BE]">Person</span>,<br className="hidden sm:inline" />
              Not the Paper
            </h1>
            <p className="text-lg sm:text-2xl md:text-4xl text-gray-500 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Job seekers show who they are in seconds. Employers see real people, not paper. Everyone saves time.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center lg:justify-start pt-4 sm:pt-6">
            <button
              onClick={() => onSelectRole("seeker")}
              className="flex-1 bg-[#0077BE] text-white py-4 px-6 sm:py-5 sm:px-8 rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-[#0077BE]/20 font-black text-base sm:text-lg tracking-tight uppercase"
            >
              Looking for a job
            </button>
            <button
              onClick={() => onSelectRole("employer")}
              className="flex-1 bg-[#2ECC71] text-white py-4 px-6 sm:py-5 sm:px-8 rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-[#2ECC71]/20 font-black text-base sm:text-lg tracking-tight uppercase"
            >
              Looking to hire
            </button>
          </div>
        </div>
        <div className="relative group">
          <div className="absolute -inset-4 bg-[#0077BE]/10 rounded-[5rem] blur-3xl"></div>
          <div className="relative rounded-[2rem] sm:rounded-[4rem] overflow-hidden shadow-[0_48px_96px_-24px_rgba(0,0,0,0.2)] aspect-square border-4 sm:border-8 border-white bg-gray-100">
            <ImageWithFallback 
              src={heroImg} 
              alt="Job Seeker Filming" 
              className="w-full h-full object-cover transition-transform duration-[5s] group-hover:scale-110" 
              loading="eager"
              fetchPriority="high"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
      </section>

      {/* How It Works - Job Seekers */}
      <section className="py-12 sm:py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">For Job Seekers</h2>
            <p className="text-lg sm:text-xl text-gray-500 font-medium">Get hired faster with video intros</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-lg">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0077BE]/10 flex items-center justify-center text-[#0077BE]">
                <Video size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-[#0077BE]">1</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Create Your Profile</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                  Record a quick video intro (or voice/text). Show your personality in 30 seconds. No lengthy resumes required.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-lg">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0077BE]/10 flex items-center justify-center text-[#0077BE]">
                <Search size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-[#0077BE]">2</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Browse Jobs</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                  Swipe through jobs for free. Filter by location, pay, and industry. No commitments until you apply.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-lg">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71]">
                <DollarSign size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-[#2ECC71]">3</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Apply & Unlock</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                  Pay ${INTERACTION_FEE.toFixed(2)} to apply and reveal the employer. Direct contact info unlocked instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Employers */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">For Employers</h2>
            <p className="text-lg sm:text-xl text-gray-500 font-medium">Find the right fit in minutes, not weeks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-lg border-2 border-gray-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71]">
                <Sparkles size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-[#2ECC71]">1</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Post Your Job</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                  Use AI assist or manual entry. Add your job details in minutes. Stay anonymous until candidates apply.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-lg border-2 border-gray-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71]">
                <Users size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-[#2ECC71]">2</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Browse Candidates</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                  Watch video intros for free. See personality and skills upfront. Swipe to add promising candidates to your queue.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 space-y-4 sm:space-y-6 shadow-lg border-2 border-gray-100">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#0077BE]/10 flex items-center justify-center text-[#0077BE]">
                <CheckCircle size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-4xl sm:text-5xl font-black text-[#0077BE]">3</span>
                  <h3 className="text-xl sm:text-2xl font-black tracking-tight">Unlock & Connect</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 font-medium leading-relaxed">
                  Pay ${INTERACTION_FEE.toFixed(2)} per candidate to unlock full profile and contact info. Reach out directly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-12 sm:py-20 px-4 bg-gradient-to-b from-[#0077BE]/5 to-transparent">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16 space-y-3 sm:space-y-4">
            <h2 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight">Why HanaHire?</h2>
            <p className="text-lg sm:text-xl text-gray-500 font-medium">Built for Hawaii's unique job market</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#0077BE] mx-auto">
                <Clock size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h4 className="text-lg sm:text-xl font-black tracking-tight">No Wasted Time</h4>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Browse for free, pay only when you connect</p>
            </div>
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#2ECC71] mx-auto">
                <Shield size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h4 className="text-lg sm:text-xl font-black tracking-tight">Privacy First</h4>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Stay anonymous until you choose to reveal</p>
            </div>
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#0077BE] mx-auto">
                <DollarSign size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h4 className="text-lg sm:text-xl font-black tracking-tight">Simple Pricing</h4>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">${INTERACTION_FEE.toFixed(2)} per unlock. No subscriptions.</p>
            </div>
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center text-[#2ECC71] mx-auto">
                <Video size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h4 className="text-lg sm:text-xl font-black tracking-tight">Video-Friendly</h4>
              <p className="text-xs sm:text-sm text-gray-600 font-medium">Video, voice, or text - your choice</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-black text-gray-900 tracking-tight leading-tight">
            Ready to Find Your Match?
          </h2>
          <p className="text-lg sm:text-2xl text-gray-500 font-medium max-w-2xl mx-auto">
            Join Hawaii's video-first job marketplace. Whether you're hiring or seeking, start in seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-4 sm:pt-6">
            <button
              onClick={() => onSelectRole("seeker")}
              className="bg-[#0077BE] text-white py-4 sm:py-6 px-8 sm:px-12 rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-[#0077BE]/20 font-black text-base sm:text-xl tracking-tight uppercase"
            >
              I'm Job Seeking
            </button>
            <button
              onClick={() => onSelectRole("employer")}
              className="bg-[#2ECC71] text-white py-4 sm:py-6 px-8 sm:px-12 rounded-[1.5rem] hover:scale-[1.02] transition-all shadow-xl shadow-[#2ECC71]/20 font-black text-base sm:text-xl tracking-tight uppercase"
            >
              I'm Hiring
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};