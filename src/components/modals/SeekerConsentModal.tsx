import React from "react";
import { Shield } from "lucide-react";

const CHECKBOXES = [
  "I understand that my video introduction and profile information will be visible to employers on the HanaHire platform.",
  "I understand that video introductions may reveal personal characteristics (such as appearance, age, accent, etc.) and I voluntarily choose to include this information.",
  "I consent to sharing my profile information with employers who unlock my profile or receive my job applications.",
  "I understand that HanaHire is a platform that connects job seekers with employers, and that hiring decisions are made solely by the employers themselves.",
  "I agree to use HanaHire in accordance with applicable employment laws and to report any discriminatory behavior I experience.",
];

interface SeekerConsentModalProps {
  isOpen: boolean;
  onAgree: () => void;
  onCancel: () => void;
}

export const SeekerConsentModal: React.FC<SeekerConsentModalProps> = ({
  isOpen,
  onAgree,
  onCancel,
}) => {
  const [checked, setChecked] = React.useState<boolean[]>(CHECKBOXES.map(() => false));

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allChecked = checked.every(Boolean);

  const toggle = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div className="fixed inset-0 top-14 md:top-20 bottom-20 md:bottom-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden"
        style={{ height: "calc(100vh - 10.5rem)" }}
      >
        {/* Header — always visible */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#148F8B]/10 flex items-center justify-center shrink-0">
              <Shield size={20} className="text-[#148F8B]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Your Profile, Your Advantage</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium">Please review and acknowledge before creating your profile.</p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-8 py-6 space-y-6" style={{ flex: "1 1 0" }}>
          {/* How your profile helps */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">How Your Profile Helps You</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li className="flex items-start gap-2"><span className="text-[#148F8B] font-black mt-0.5">✓</span>Showcase your personality, work ethic, and communication skills</li>
              <li className="flex items-start gap-2"><span className="text-[#148F8B] font-black mt-0.5">✓</span>Highlight your unique strengths beyond what a resume shows</li>
              <li className="flex items-start gap-2"><span className="text-[#148F8B] font-black mt-0.5">✓</span>Help you stand out to Hawaii's small business community</li>
            </ul>
          </div>

          {/* Rights */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Rights & Protections</p>
            <div className="space-y-3 text-sm text-gray-700">
              <p><span className="font-black text-gray-900">Non-Discrimination:</span> We expect all employers to evaluate candidates based on qualifications, skills, and fit — not on protected characteristics such as race, color, religion, sex, national origin, age, disability, or genetic information.</p>
              <p><span className="font-black text-gray-900">Transparency:</span> You control what information you share. Your profile is only visible to employers when you apply or make your profile searchable.</p>
              <p><span className="font-black text-gray-900">Data Privacy:</span> Your personal information is protected and only shared with employers when you apply or they unlock your profile.</p>
            </div>
          </div>

          {/* Checkboxes */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Consent — All required</p>
            <div className="space-y-3">
              {CHECKBOXES.map((label, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                      checked[i]
                        ? "bg-[#148F8B] border-[#148F8B]"
                        : "border-gray-300 group-hover:border-[#148F8B]"
                    }`}
                    onClick={() => toggle(i)}
                  >
                    {checked[i] && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700 leading-relaxed">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer — always visible */}
        <div className="px-8 pb-8 pt-4 border-t border-gray-100 flex gap-3 shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl border-2 border-gray-200 text-gray-600 font-black uppercase tracking-widest text-xs hover:border-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onAgree}
            disabled={!allChecked}
            className={`flex-[2] h-12 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${
              allChecked
                ? "bg-[#148F8B] text-white hover:bg-[#0D7377] hover:scale-[1.02] active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            I Agree and Continue
          </button>
        </div>
      </div>
    </div>
  );
};
