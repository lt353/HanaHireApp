import React from "react";
import { Scale } from "lucide-react";

const PLATFORM_CHECKBOXES = [
  "I will evaluate all candidates based on their qualifications, skills, and fit for the role.",
  "I will not discriminate against candidates based on race, color, religion, sex, national origin, age, disability, genetic information, or other protected characteristics.",
  "I understand that candidate video introductions may reveal personal characteristics, and I will use this information appropriately and in compliance with applicable laws.",
  "I understand that HanaHire is a marketplace platform and does not control hiring decisions — I am solely responsible for my hiring practices.",
  "I will comply with all applicable federal, state, and local employment laws.",
  "I understand that misuse of the platform or discriminatory hiring practices may result in account termination and potential legal liability.",
];

interface EmployerConsentModalProps {
  isOpen: boolean;
  onAgree: (employeeCountRange: string) => void;
  onCancel: () => void;
}

export const EmployerConsentModal: React.FC<EmployerConsentModalProps> = ({
  isOpen,
  onAgree,
  onCancel,
}) => {
  const [countLt15, setCountLt15] = React.useState(false);
  const [count15plus, setCount15plus] = React.useState(false);
  const [checked, setChecked] = React.useState<boolean[]>(PLATFORM_CHECKBOXES.map(() => false));

  if (!isOpen) return null;

  const employeeCountSelected = countLt15 || count15plus;
  const allPlatformChecked = checked.every(Boolean);
  const canAgree = employeeCountSelected && allPlatformChecked;

  const togglePlatform = (i: number) =>
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));

  const handleAgree = () => {
    const range = countLt15 ? "1-14" : "15+";
    onAgree(range);
  };

  return (
    <div className="fixed inset-0 top-14 md:top-20 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#A63F8E]/10 flex items-center justify-center shrink-0">
              <Scale size={20} className="text-[#A63F8E]" />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-gray-900">Fair Hiring Practices Commitment</h2>
          </div>
          <p className="text-sm text-gray-500 font-medium">Please review and agree before posting jobs or browsing candidates.</p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto px-8 py-6 space-y-6 flex-1">
          {/* Commitment summary */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Your Commitment to Fair Hiring</p>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-black text-gray-900">Evaluate on qualifications:</span> Review candidates based on skills, experience, work ethic, and fit — not on protected characteristics.</p>
              <p><span className="font-black text-gray-900">Comply with applicable laws:</span> Follow all federal, state, and local employment laws that apply to your business.</p>
              <p><span className="font-black text-gray-900">Use candidate information appropriately:</span> Access profiles and videos solely for legitimate hiring purposes.</p>
            </div>
          </div>

          {/* Non-discrimination standards */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Federal Law Prohibits Discrimination Based On</p>
            <p className="text-xs text-gray-600 leading-relaxed">
              Race, color, religion, sex (including pregnancy, gender identity, and sexual orientation), national origin, age (40 or older), disability, and genetic information.
            </p>
            <p className="text-xs text-[#A63F8E] font-bold mt-2">
              Even if your business employs fewer than 15 employees, HanaHire expects all employers to treat candidates fairly and respectfully.
            </p>
          </div>

          {/* Employee count — two separate checkboxes, mutually exclusive */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Business Size Verification — Select one</p>
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                    countLt15
                      ? "bg-[#A63F8E] border-[#A63F8E]"
                      : "border-gray-300 group-hover:border-[#A63F8E]"
                  }`}
                  onClick={() => { setCountLt15(true); setCount15plus(false); }}
                >
                  {countLt15 && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">
                  My business currently employs <span className="font-black">fewer than 15 employees</span>.
                  <span className="block text-xs text-gray-400 mt-0.5">Note: EEOC laws generally apply to employers with 15+ employees (20+ for age discrimination).</span>
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                    count15plus
                      ? "bg-[#A63F8E] border-[#A63F8E]"
                      : "border-gray-300 group-hover:border-[#A63F8E]"
                  }`}
                  onClick={() => { setCount15plus(true); setCountLt15(false); }}
                >
                  {count15plus && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">
                  My business employs <span className="font-black">15 or more employees</span>, and I understand that I am subject to EEOC laws and regulations.
                </span>
              </label>
            </div>
          </div>

          {/* Platform agreement checkboxes */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Platform Use Agreement — All required</p>
            <div className="space-y-3">
              {PLATFORM_CHECKBOXES.map((label, i) => (
                <label key={i} className="flex items-start gap-3 cursor-pointer group">
                  <div
                    className={`mt-0.5 w-5 h-5 shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                      checked[i]
                        ? "bg-[#A63F8E] border-[#A63F8E]"
                        : "border-gray-300 group-hover:border-[#A63F8E]"
                    }`}
                    onClick={() => togglePlatform(i)}
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

        {/* Footer */}
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
            onClick={handleAgree}
            disabled={!canAgree}
            className={`flex-[2] h-12 rounded-2xl font-black uppercase tracking-widest text-sm transition-all ${
              canAgree
                ? "bg-[#A63F8E] text-white hover:bg-[#8B3378] hover:scale-[1.02] active:scale-95"
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
