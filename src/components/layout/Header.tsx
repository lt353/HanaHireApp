import React from "react";
import { Zap, ShoppingCart, Settings as SettingsIcon } from "lucide-react";
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
  onSelectRole: (role: 'seeker' | 'employer') => void;  // ADD
  onToggleRole: () => void;  // ADD
  onLogout: () => void;  // ADD
  onShowAuth: (mode: "login" | "signup") => void;  // ADD
  onReset: () => void;  // ADD
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
  onReset
}) => {
  const queueCount = role === "seeker" ? seekerQueueCount : employerQueueCount;

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm px-3 sm:px-4 md:px-8 h-20 flex items-center justify-between gap-2">
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
                Talent Pool
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
          </div>
        ) : (
          <div className="hidden lg:flex items-center gap-6">
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
              onClick={() => onSelectRole("seeker")}
              className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-[#0077BE]"
            >
              Looking for a job
            </button>
            <button
              onClick={() => onSelectRole("employer")}
              className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-400 hover:text-[#0077BE]"
            >
              Looking to hire
            </button>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 shrink-0">
        {/* Auth / account controls */}
        {!isLoggedIn ? (
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              className="h-9 sm:h-10 px-2 sm:px-3 md:px-5 border-none text-[9px] sm:text-[10px] whitespace-nowrap"
              onClick={() => onShowAuth("login")}
            >
              Log In
            </Button>

            <Button
              className={`h-9 sm:h-10 px-2 sm:px-3 md:px-5 text-[9px] sm:text-[10px] whitespace-nowrap ${
                role === "employer" ? "bg-[#2ECC71]" : ""
              }`}
              onClick={() => onShowAuth("signup")}
            >
              {role === "employer" ? "Get Started" : "Sign Up"}
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-4">
            {isRoleSelected && (
              <button
                onClick={onToggleRole}
                className="hidden sm:block px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-[9px] font-black hover:bg-gray-100 border border-gray-100 transition-all uppercase tracking-widest whitespace-nowrap"
              >
                Switch to {role === "seeker" ? "Employer" : "Job Seeker"}
              </button>
            )}

            <button
              onClick={onLogout}
              className="hidden sm:block text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest whitespace-nowrap"
            >
              Log Out
            </button>
          </div>
        )}

        {/* Cart + settings only after role is selected (not on Home) */}
        {isRoleSelected && (
          <>
            <button
              onClick={() => onNavigate("cart")}
              className="relative p-2 sm:p-3 rounded-2xl bg-gray-50 text-gray-400 border border-gray-100 hover:bg-white transition-all"
              aria-label="Cart"
            >
              <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
              {queueCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#FF6B6B] text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                  {queueCount}
                </span>
              )}
            </button>

            {isLoggedIn && (
              <button
                onClick={() => onNavigate("settings")}
                className={`p-2 sm:p-3 rounded-2xl transition-all ${
                  currentTab === "settings"
                    ? "bg-[#0077BE]/10 text-[#0077BE]"
                    : "text-gray-400 hover:bg-gray-50"
                }`}
                aria-label="Settings"
              >
                <SettingsIcon size={18} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </>
        )}
      </div>
    </nav>
  );
};