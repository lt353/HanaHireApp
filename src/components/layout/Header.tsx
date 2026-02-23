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
  isPaymentModalOpen?: boolean;
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
  isPaymentModalOpen = false
}) => {
  const queueCount = role === "seeker" ? seekerQueueCount : employerQueueCount;

  if (isPaymentModalOpen) {
    return null;
  }

  return (
    <nav
      className="hidden md:flex sticky top-0 z-40 px-3 sm:px-4 md:px-8 h-20 items-center justify-between gap-2 transition-colors duration-200 relative"
      style={{ backgroundColor: '#FAF9F7' }}
    >
      {/* Gradient bottom border */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '5px',
        background: 'linear-gradient(to right, #148F8B, #A63F8E)'
      }} />

      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-4 md:gap-10 min-w-0 flex-1">
        <button
          onClick={onReset}
          className="text-xl sm:text-2xl md:text-3xl font-black tracking-tighter flex items-center gap-1 sm:gap-2 group shrink-0 hover:scale-105 active:scale-95 transition-all duration-200"
        >
          <Zap
            size={20}
            className="sm:w-[26px] sm:h-[26px]"
            fill={!isRoleSelected ? "#A63F8E" : role === "seeker" ? "#148F8B" : "#A63F8E"}
          />
          <span className="truncate">
            <span style={{ color: '#148F8B', WebkitTextFillColor: '#148F8B' }}>Hana</span>
            <span style={{ color: '#A63F8E', WebkitTextFillColor: '#A63F8E' }}>Hire</span>
          </span>
        </button>

        {isRoleSelected ? (
          <div className="hidden lg:flex items-center gap-6">
            {isLoggedIn && (
              <button
                onClick={() =>
                  onNavigate(role === "seeker" ? "seeker" : "employer")
                }
                className={`text-sm sm:text-base uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                  (currentTab === "seeker" || currentTab === "employer")
                    ? "font-black"
                    : "font-bold hover:text-gray-900"
                }`}
                style={{
                  color: role === "seeker" ? "#148F8B" : "#A63F8E"
                }}
              >
                Dashboard
              </button>
            )}

            {role === "seeker" && (
              <button
                onClick={() => onNavigate("jobs")}
                className={`text-sm sm:text-base uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                  currentTab === "jobs"
                    ? "font-black"
                    : "font-bold hover:text-gray-900"
                }`}
                style={{ color: "#148F8B" }}
              >
                Browse Jobs
              </button>
            )}

            {role === "employer" && (
              <button
                onClick={() => onNavigate("job-posting")}
                className={`text-sm sm:text-base uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                  currentTab === "job-posting"
                    ? "font-black"
                    : "font-bold hover:text-gray-900"
                }`}
                style={{ color: "#A63F8E" }}
              >
                Post Job
              </button>
            )}

            {role === "employer" && (
              <button
                onClick={() => onNavigate("candidates")}
                className={`text-sm sm:text-base uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                  currentTab === "candidates"
                    ? "font-black"
                    : "font-bold hover:text-gray-900"
                }`}
                style={{ color: "#A63F8E" }}
              >
                Find Talent
              </button>
            )}

            <button
              onClick={() => onNavigate("about")}
              className={`text-sm sm:text-base uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                currentTab === "about"
                  ? "font-black"
                  : "font-bold hover:text-gray-900"
              }`}
              style={{
                color: !isRoleSelected
                  ? "#A63F8E"
                  : role === "seeker"
                    ? "#148F8B"
                    : "#A63F8E"
              }}
            >
              About
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className={`text-sm sm:text-base uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 ${
                currentTab === "settings"
                  ? "font-black"
                  : "font-bold hover:text-gray-900"
              }`}
              style={{
                color: !isRoleSelected
                  ? "#A63F8E"
                  : role === "seeker"
                    ? "#148F8B"
                    : "#A63F8E"
              }}
            >
              <SettingsIcon size={20} className="sm:w-6 sm:h-6" />
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
              className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-100 transition-all text-xs sm:text-sm font-black uppercase tracking-widest text-gray-600 hover:scale-105 active:scale-95 duration-200 ${
                role === "seeker"
                  ? "hover:border-[#148F8B] hover:bg-[#148F8B]/5 hover:text-[#148F8B]"
                  : "hover:border-[#A63F8E] hover:bg-[#A63F8E]/5 hover:text-[#A63F8E]"
              }`}
            >
              Switch to {role === "seeker" ? "Employer" : "Job Seeker"}
            </button>
          </>
        )}

        {/* Auth Buttons */}
        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="h-9 sm:h-10 md:h-12 px-3 sm:px-4 md:px-6 text-sm sm:text-base md:text-lg hover:scale-105 active:scale-95 transition-all duration-200 rounded-2xl font-black text-white hover:opacity-90"
            style={{ backgroundColor: '#A63F8E' }}
          >
            Sign Out
          </button>
        ) : (
          <div className="flex gap-1 sm:gap-2">
            <button
              onClick={() => onShowAuth("login")}
              className="h-9 sm:h-10 md:h-12 px-2 sm:px-3 md:px-4 text-sm sm:text-base md:text-lg hover:scale-105 active:scale-95 transition-all duration-200 rounded-2xl font-black text-white hover:opacity-90"
              style={{ backgroundColor: '#A63F8E' }}
            >
              Log In
            </button>
            <button
              onClick={() => onShowAuth("signup")}
              className="h-9 sm:h-10 md:h-12 px-2 sm:px-3 md:px-4 text-sm sm:text-base md:text-lg shadow-lg shadow-[#148F8B]/20 hover:scale-105 active:scale-95 transition-all duration-200 rounded-2xl font-black text-white hover:opacity-90"
              style={{ backgroundColor: '#148F8B' }}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};