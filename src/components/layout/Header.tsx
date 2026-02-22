import React from "react";
import { Zap, FolderOpen, Settings as SettingsIcon } from "lucide-react";
import { Button } from "../ui/Button";

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
          className="text-xl sm:text-2xl md:text-3xl font-black text-[#1A7A84] tracking-tighter flex items-center gap-1 sm:gap-2 group shrink-0 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Zap size={20} className="sm:w-[26px] sm:h-[26px]" fill="#1A7A84" />
          <span className="truncate">HanaHire</span>
        </button>

        {isRoleSelected ? (
          <div className="hidden lg:flex items-center gap-6">
            {isLoggedIn && (
              <button
                onClick={() =>
                  onNavigate(role === "seeker" ? "seeker" : "employer")
                }
                className={`font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                  (currentTab === "seeker" || currentTab === "employer")
                    ? "text-[#1A7A84]"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Dashboard
              </button>
            )}

            {role === "seeker" && (
              <button
                onClick={() => onNavigate("jobs")}
                className={`font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                  currentTab === "jobs"
                    ? "text-[#1A7A84]"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Browse Jobs
              </button>
            )}

            {role === "employer" && (
              <button
                onClick={() => onNavigate("job-posting")}
                className={`font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                  currentTab === "job-posting"
                    ? "text-[#1A7A84]"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Post Job
              </button>
            )}

            {role === "employer" && (
              <button
                onClick={() => onNavigate("candidates")}
                className={`font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                  currentTab === "candidates"
                    ? "text-[#1A7A84]"
                    : "text-gray-400 hover:text-gray-900"
                }`}
              >
                Find Talent
              </button>
            )}

            <button
              onClick={() => onNavigate("about")}
              className={`font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                currentTab === "about"
                  ? "text-[#1A7A84]"
                  : "text-gray-400 hover:text-gray-900"
              }`}
            >
              About
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className={`font-black text-[10px] uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                currentTab === "settings"
                  ? "text-[#1A7A84]"
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
              className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 hover:border-[#1A7A84] hover:bg-[#1A7A84]/5 transition-all text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-[#1A7A84] hover:scale-105 active:scale-95 duration-200"
            >
              Switch to {role === "seeker" ? "Employer" : "Job Seeker"}
            </button>

          </>
        )}

        {/* Auth Buttons */}
        {isLoggedIn ? (
          <Button
            onClick={onLogout}
            variant="secondary"
            className="h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 text-[10px] sm:text-xs md:text-sm hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Sign Out
          </Button>
        ) : (
          <div className="flex gap-1 sm:gap-2">
            <Button
              onClick={() => onShowAuth("login")}
              variant="secondary"
              className="h-9 sm:h-10 md:h-12 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs md:text-sm hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Log In
            </Button>
            <Button
              onClick={() => onShowAuth("signup")}
              variant="primary"
              className="h-9 sm:h-10 md:h-12 px-2 sm:px-3 md:px-4 text-[10px] sm:text-xs md:text-sm shadow-lg shadow-[#1A7A84]/20 hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Sign Up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};