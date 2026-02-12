import React from "react";
import { Zap, FolderOpen, Settings as SettingsIcon } from "lucide-react";
import { Button } from "../ui/button";

import { ViewType } from '../../App';

interface HeaderProps {
  isRoleSelected: boolean;
  role: 'seeker' | 'employer';
  currentTab: ViewType;
  isLoggedIn: boolean;
  seekerQueueCount: number;
  employerQueueCount: number;
  onNavigate: (view: ViewType) => void;
  onSelectRole: (role: 'seeker' | 'employer') => void;
  onToggleRole: () => void;
  onLogout: () => void;
  onShowAuth: (mode: "login" | "signup") => void;
  onReset: () => void;
  isPaymentModalOpen?: boolean;  // ADD THIS LINE
}

export const Header: React.FC<HeaderProps> = ({
  isRoleSelected,
  role,
  currentTab,
  isLoggedIn,
  seekerQueueCount,
  employerQueueCount,
  onNavigate,
  onSelectRole,
  onToggleRole,
  onLogout,
  onShowAuth,
  onReset,
  isPaymentModalOpen = false  // ADD THIS LINE
}) => {
  const queueCount = role === "seeker" ? seekerQueueCount : employerQueueCount;

  // HIDE HEADER WHEN PAYMENT MODAL IS OPEN
  if (isPaymentModalOpen) {
    return null;
  }

  return (
    <nav className="hidden md:flex sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-3 sm:px-4 md:px-8 h-20 items-center justify-between gap-2">
      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-10 min-w-0 flex-1">
        <button
          onClick={onReset}
          className="text-xl sm:text-2xl md:text-3xl font-black text-[#0077BE] tracking-tighter flex items-center gap-1 sm:gap-2 group shrink-0"
        >
          <Zap size={20} className="sm:w-[26px] sm:h-[26px]" fill="#0077BE" />
          <span className="truncate">HanaHire</span>
        </button>

        {isRoleSelected ? (
          <div className="hidden lg:flex items-center gap-6">
            {isLoggedIn && (
              <button
                onClick={() =>
                  onNavigate(role === "seeker" ? "seeker" : "employer")
                }
                className={`font-black text-[10px] uppercase tracking-[0.2em] ${
                  (currentTab === "seeker" || currentTab === "employer")
                    ? "text-[#0077BE]"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Dashboard
              </button>
            )}

            {role === "seeker" && (
              <button
                onClick={() => onNavigate("jobs")}
                className={`font-black text-[10px] uppercase tracking-[0.2em] ${
                  currentTab === "jobs"
                    ? "text-[#0077BE]"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Browse Jobs
              </button>
            )}

            {role === "employer" && (
              <button
                onClick={() => onNavigate("job-posting")}
                className={`font-black text-[10px] uppercase tracking-[0.2em] ${
                  currentTab === "job-posting"
                    ? "text-[#0077BE]"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Post Job
              </button>
            )}

            {role === "employer" && (
              <button
                onClick={() => onNavigate("candidates")}
                className={`font-black text-[10px] uppercase tracking-[0.2em] ${
                  currentTab === "candidates"
                    ? "text-[#0077BE]"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Find Talent
              </button>
            )}

            <button
              onClick={() => onNavigate("about")}
              className={`font-black text-[10px] uppercase tracking-[0.2em] ${
                currentTab === "about"
                  ? "text-[#0077BE]"
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              About
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className={`font-black text-[10px] uppercase tracking-[0.2em] ${
                currentTab === "settings"
                  ? "text-[#0077BE]"
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              <SettingsIcon size={16} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
        {isRoleSelected && (
          <>
            {/* Role Toggle - Desktop Only */}
            <button
              onClick={onToggleRole}
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 hover:border-[#0077BE] hover:bg-[#0077BE]/5 transition-all text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-[#0077BE]"
            >
              Switch to {role === "seeker" ? "Employer" : "Job Seeker"}
            </button>

            {/* Cart Button */}
            <button
              onClick={() => onNavigate("cart")}
              className={`relative p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl transition-all ${
                currentTab === "cart"
                  ? "bg-[#0077BE] text-white shadow-lg"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              <FolderOpen size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6" />
              {queueCount > 0 && (
                <span className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 bg-[#0077BE] text-white text-[9px] sm:text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {queueCount}
                </span>
              )}
            </button>
          </>
        )}

        {/* Auth Buttons */}
        {isLoggedIn ? (
          <Button
            onClick={onLogout}
            className="h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 text-[10px] sm:text-xs md:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-black uppercase tracking-widest"
          >
            Sign Out
          </Button>
        ) : (
          <div className="flex gap-1 sm:gap-2">
            <Button
              onClick={() => onShowAuth("login")}
              className="h-9 sm:h-10 md:h-12 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs md:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-black uppercase tracking-widest"
            >
              Log In
            </Button>
            <Button
              onClick={() => onShowAuth("signup")}
              className="h-9 sm:h-10 md:h-12 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs md:text-sm bg-[#0077BE] hover:bg-[#0077BE]/90 text-white font-black uppercase tracking-widest shadow-lg shadow-[#0077BE]/20"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};