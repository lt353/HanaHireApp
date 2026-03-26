import React from "react";
import { motion } from "motion/react";
import { User } from "lucide-react";
import { Button } from "../ui/Button";
import { ViewType } from '../../App';
import { TEAM_MEMBERS, INTERACTION_FEE } from "../../data/mockData";

// Auto-load team photos from `src/assets` by filename.
// Expected filenames (case-insensitive): `tea.png`, `lindsay.png`, `brisa.png`, `dj.png`, `ethan.png`, etc.
const teamPhotos = import.meta.glob("../../assets/*.{png,jpg,jpeg,webp}", {
  eager: true,
  import: "default",
});

const teamPhotoByKey = Object.fromEntries(
  Object.entries(teamPhotos).map(([path, url]) => {
    const filename = path.split("/").pop() ?? "";
    const key = filename.replace(/\.[^.]+$/, "").toLowerCase();
    return [key, url as string];
  })
) as Record<string, string>;

interface AboutProps {
  onSelectRole: (role: 'seeker' | 'employer') => void;
  onNavigate: (view: ViewType) => void;
}

export const About: React.FC<AboutProps> = ({ onSelectRole, onNavigate }) => {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-12 sm:py-20 space-y-12 sm:space-y-20">
      <div className="space-y-8 text-center">
        <h2 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter">Why We Built HanaHire</h2>
        <div className="space-y-4 text-base sm:text-xl md:text-2xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto text-left">
          <p>We got tired of the same broken hiring process.</p>
          <p>Job seekers spending hours tailoring resumes that never get read. Employers drowning in applications from people they'll never meet. Everyone frustrated. Everyone wasting time.</p>
          <p>So we asked: what if hiring was actually about people?</p>
          <p>Not keywords. Not buzzwords. Not perfectly formatted PDFs that all say the same thing.</p>
          <p className="text-gray-900 font-black">Real people. Real conversations. Real jobs. That's HanaHire.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 sm:gap-10">
        <div className="p-6 sm:p-10 bg-[#148F8B]/5 rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-6">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">How It Works</h3>
          <div className="space-y-4 text-gray-600 font-medium text-sm sm:text-base">
            <p className="font-black text-gray-900">For Job Seekers:</p>
            <p>You're more than a resume. Show it. Record your intro once. Browse jobs and apply instantly. But here's the real power: employers can find YOU, even for jobs you never saw. Join the talent pool. Get discovered. Land opportunities you didn't know existed. Completely free.</p>
            <p className="font-black text-gray-900 pt-4">For Employers:</p>
            <p>Stop reading resumes. Start seeing people. Post your job and let candidates apply easily. But don't wait around for the right candidate to find you, browse the talent pool for active job seekers before you even post a job. Pay ${INTERACTION_FEE.toFixed(2)} only when you find a candidate you want to connect with.</p>
          </div>
        </div>
        <div className="p-6 sm:p-10 bg-gray-900 text-white rounded-[2rem] sm:rounded-[3rem] space-y-4 sm:space-y-6">
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-[#A63F8E]">What Makes Us Different</h3>
          <div className="space-y-4 text-white/70 font-medium text-sm sm:text-base">
            <p><span className="text-white font-black">Video-first, not video-required.</span> Want to show your face? Great. Prefer a voice intro or a transcript? That works too.</p>
            <p><span className="text-white font-black">The talent pool works both ways.</span> Job seekers don't just apply—they get discovered. Employers don't just wait for applications—they can search the entire pool of active candidates. Find each other, not just whoever applied today.</p>
            <p><span className="text-white font-black">No subscriptions.</span> Free for job seekers. Employers pay just pay just ${INTERACTION_FEE.toFixed(2)} per unlock when they find someone they want to connect with. No monthly fees.</p>
            <p><span className="text-white font-black">Browse before you commit.</span> Explore without barriers.</p>
          </div>
        </div>
      </div>

      <div className="space-y-10 sm:space-y-16">
        <div className="text-center space-y-3 sm:space-y-4">
          <h3 className="text-3xl sm:text-5xl font-black tracking-tighter">Meet the Team</h3>
          <p className="text-base sm:text-xl text-gray-500 font-medium">We're a team of 5 people who believe work should work better.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-8">
          {TEAM_MEMBERS.map((m, i) => (
            <div key={i} className="space-y-3 text-center">
              <div className="aspect-square rounded-[1.5rem] sm:rounded-[2rem] bg-gray-100 border border-gray-100 flex items-center justify-center overflow-hidden">
                {teamPhotoByKey[m.name.toLowerCase()] ? (
                  <img
                    src={teamPhotoByKey[m.name.toLowerCase()]}
                    alt={m.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={48} className="text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-black text-base sm:text-xl tracking-tight leading-none">{m.name}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-[#148F8B] pt-1">{m.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-8 sm:gap-12 border-t border-gray-100 pt-10 sm:pt-16 text-center">
        <div className="space-y-4 w-full">
          <p className="text-lg sm:text-2xl font-black tracking-tight">Ready to skip the resume pile?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button className="h-14 sm:h-20 px-8 sm:px-12 text-base sm:text-xl rounded-[1.5rem]" onClick={() => onSelectRole("seeker")}>Browse Jobs</Button>
            <Button variant="outline" className="h-14 sm:h-20 px-8 sm:px-12 text-base sm:text-xl rounded-[1.5rem]" onClick={() => onSelectRole("employer")}>Find Talent</Button>
          </div>
        </div>
        <div className="space-y-4">
          <p className="text-base sm:text-xl font-black uppercase tracking-widest text-gray-600">Questions?</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-[11px] font-black uppercase tracking-widest text-gray-400">
            <button type="button" className="hover:text-[#148F8B]" onClick={() => onNavigate("settings")}>Contact Us</button>
            <button type="button" className="hover:text-[#148F8B]" onClick={() => onNavigate("about")}>How It Works</button>
            <button type="button" className="hover:text-[#148F8B]">Pricing</button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
