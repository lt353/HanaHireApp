import React from "react";
import { motion } from "motion/react";
import { User } from "lucide-react";
import { Button } from "../ui/Button";
import { TEAM_MEMBERS, INTERACTION_FEE } from "../../data/mockData";

interface AboutProps {
  onSelectRole: (role: 'seeker' | 'employer') => void;
  onNavigate: (tab: string) => void;
}

export const About: React.FC<AboutProps> = ({ onSelectRole, onNavigate }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-24 space-y-24">
      <div className="space-y-12 text-center">
        <h2 className="text-6xl md:text-8xl font-black tracking-tighter">Why We Built HanaHire</h2>
        <div className="space-y-6 text-2xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto text-left">
          <p>We got tired of the same broken hiring process.</p>
          <p>Job seekers spending hours tailoring resumes that never get read. Employers drowning in applications from people they'll never meet. Everyone frustrated. Everyone wasting time.</p>
          <p>So we asked: what if hiring was actually about people?</p>
          <p>Not keywords. Not buzzwords. Not perfectly formatted PDFs that all say the same thing.</p>
          <p className="text-gray-900 font-black">Real people. Real conversations. Real jobs. That's HanaHire.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="p-12 bg-[#0077BE]/5 rounded-[4rem] space-y-6">
          <h3 className="text-4xl font-black tracking-tight">How It Works</h3>
          <div className="space-y-4 text-gray-600 font-medium">
            <p className="font-black text-gray-900">For Job Seekers:</p>
            <p>You're more than a resume. Show it. Record a intro in seconds. Be yourself. Browse jobs and apply with one click for ${INTERACTION_FEE.toFixed(2)}. No cover letters. No endless forms.</p>
            <p className="font-black text-gray-900 pt-4">For Employers:</p>
            <p>Stop reading resumes. Start seeing people. Post your job easily. Browse video applications from real candidates. Pay ${INTERACTION_FEE.toFixed(2)} to unlock the profiles you want.</p>
          </div>
        </div>
        <div className="p-12 bg-gray-900 text-white rounded-[4rem] space-y-6">
          <h3 className="text-4xl font-black tracking-tight text-[#2ECC71]">What Makes Us Different</h3>
          <div className="space-y-4 text-white/70 font-medium">
            <p><span className="text-white font-black">Video-first, not video-required.</span> Want to show your face? Great. Prefer a voice intro or a transcript? That works too.</p>
            <p><span className="text-white font-black">No subscriptions.</span> Pay ${INTERACTION_FEE.toFixed(2)} when you apply or unlock. No monthly fees.</p>
            <p><span className="text-white font-black">Browse before you commit.</span> Explore without barriers.</p>
          </div>
        </div>
      </div>

      <div className="space-y-16">
        <div className="text-center space-y-4">
          <h3 className="text-6xl font-black tracking-tighter">Meet the Team</h3>
          <p className="text-xl text-gray-500 font-medium">We're a team of 5 people who believe work should work better.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {TEAM_MEMBERS.map((m, i) => (
            <div key={i} className="space-y-4 text-center group">
              <div className="aspect-square rounded-[2rem] bg-gray-100 border border-gray-100 flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                <User size={64} className="text-gray-300" />
              </div>
              <div>
                <p className="font-black text-xl tracking-tight leading-none">{m.name}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#0077BE] pt-1">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-12 border-t border-gray-100 pt-16 text-center">
        <div className="space-y-4">
          <p className="text-2xl font-black tracking-tight">Ready to skip the resume pile?</p>
          <div className="flex gap-4">
            <Button className="h-20 px-12 text-xl rounded-[1.5rem]" onClick={() => onSelectRole("seeker")}>Browse Jobs</Button>
            <Button variant="outline" className="h-20 px-12 text-xl rounded-[1.5rem]" onClick={() => onSelectRole("employer")}>Find Talent</Button>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-xl font-black uppercase tracking-widest text-gray-300">Questions?</p>
          <div className="flex flex-wrap justify-center gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
            <button className="hover:text-[#0077BE]" onClick={() => onNavigate("settings")}>Contact Us</button>
            <button className="hover:text-[#0077BE]" onClick={() => onNavigate("about")}>How It Works</button>
            <button className="hover:text-[#0077BE]">Pricing</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
