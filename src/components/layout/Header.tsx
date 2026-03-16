import { Zap, Settings as SettingsIcon } from "lucide-react";

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
  isDemoAccount?: boolean;
  totalUnreadMessages?: number;
}

export const Header = ({
  isRoleSelected,
  role,
  currentTab,
  isLoggedIn,
  onNavigate,
  onToggleRole,
  onLogout,
  onShowAuth,
  onReset,
  isPaymentModalOpen = false,
  isDemoAccount = false,
  totalUnreadMessages = 0,
}: HeaderProps) => {

  const borderStyle = !isRoleSelected
    ? 'linear-gradient(to right, #148F8B, #A63F8E)'
    : role === 'seeker'
      ? '#148F8B'
      : '#A63F8E';

  if (isPaymentModalOpen) {
    return null;
  }

  return (
    <nav
      className="hidden md:flex sticky top-0 z-40 px-4 md:px-5 lg:px-6 xl:px-8 h-20 items-center justify-between gap-2 transition-colors duration-200 relative"
      style={{ backgroundColor: '#FAF9F7' }}
    >
      {/* Bottom border — gradient on landing, solid on role pages */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '5px',
        background: borderStyle,
        transition: 'background 0.4s ease',
      }} />

      {/* Left */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-8 min-w-0 flex-1">
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
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-6 flex-nowrap shrink min-w-0">
            {isLoggedIn && (
              <>
                <button
                  onClick={() => onNavigate(role === "seeker" ? "seeker" : "employer")}
                  className={`text-[11px] md:text-xs lg:text-sm xl:text-base uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] xl:tracking-[0.2em] whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 ${
                    (currentTab === "seeker" || currentTab === "employer")
                      ? "font-black"
                      : "font-bold hover:text-gray-900"
                  }`}
                  style={{ color: role === "seeker" ? "#148F8B" : "#A63F8E" }}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => onNavigate("messages")}
                  className={`inline-flex items-center gap-1 md:gap-1.5 text-[11px] md:text-xs lg:text-sm xl:text-base uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] xl:tracking-[0.2em] whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 ${
                    currentTab === "messages" ? "font-black" : "font-bold hover:text-gray-900"
                  }`}
                  style={{ color: role === "seeker" ? "#148F8B" : "#A63F8E" }}
                >
                  Messages
                  {totalUnreadMessages > 0 && (
                    <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '9px', fontWeight: 900, borderRadius: '999px', minWidth: '1rem', height: '1rem', padding: '0 3px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}>
                      {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                    </span>
                  )}
                </button>
              </>
            )}

            {role === "seeker" && (
              <button
                onClick={() => onNavigate("jobs")}
                className={`text-[11px] md:text-xs lg:text-sm xl:text-base uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] xl:tracking-[0.2em] whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 ${
                  currentTab === "jobs" ? "font-black" : "font-bold hover:text-gray-900"
                }`}
                style={{ color: "#148F8B" }}
              >
                Browse Jobs
              </button>
            )}

            {role === "employer" && (
              <button
                onClick={() => onNavigate("job-posting")}
                className={`text-[11px] md:text-xs lg:text-sm xl:text-base uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] xl:tracking-[0.2em] whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 ${
                  currentTab === "job-posting" ? "font-black" : "font-bold hover:text-gray-900"
                }`}
                style={{ color: "#A63F8E" }}
              >
                Post Job
              </button>
            )}

            {role === "employer" && (
              <button
                onClick={() => onNavigate("candidates")}
                className={`text-[11px] md:text-xs lg:text-sm xl:text-base uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] xl:tracking-[0.2em] whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 ${
                  currentTab === "candidates" ? "font-black" : "font-bold hover:text-gray-900"
                }`}
                style={{ color: "#A63F8E" }}
              >
                Find Talent
              </button>
            )}

            <button
              onClick={() => onNavigate("about")}
              className={`text-[11px] md:text-xs lg:text-sm xl:text-base uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] xl:tracking-[0.2em] whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 ${
                currentTab === "about" ? "font-black" : "font-bold hover:text-gray-900"
              }`}
              style={{ color: role === "seeker" ? "#148F8B" : "#A63F8E" }}
            >
              About
            </button>

            <button
              onClick={() => onNavigate("settings")}
              className={`text-[11px] md:text-xs lg:text-sm xl:text-base uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] xl:tracking-[0.2em] hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 ${
                currentTab === "settings" ? "font-black" : "font-bold hover:text-gray-900"
              }`}
              style={{ color: role === "seeker" ? "#148F8B" : "#A63F8E" }}
            >
              <SettingsIcon className="w-4 h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 shrink-0" />
            </button>
          </div>
        ) : (
          /* Landing page — show About link */
          <div className="hidden md:flex items-center gap-2 lg:gap-3 xl:gap-6 flex-nowrap shrink-0">
            <button
              onClick={() => onNavigate("about")}
              className={`text-[11px] md:text-xs lg:text-sm xl:text-base uppercase tracking-[0.08em] md:tracking-[0.1em] lg:tracking-[0.15em] xl:tracking-[0.2em] whitespace-nowrap hover:scale-105 active:scale-95 transition-all duration-200 shrink-0 ${
                currentTab === "about" ? "font-black" : "font-bold hover:text-gray-900"
              }`}
              style={{ color: "#A63F8E" }}
            >
              About
            </button>
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
        {isRoleSelected && (
          <>
            {/* Role Toggle - Desktop Only */}
            {isDemoAccount ? (
              <span className="hidden md:block text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1.5 lg:px-3 lg:py-2 select-none shrink-0">
                Switch roles unavailable in demo
              </span>
            ) : (
              <button
                onClick={onToggleRole}
                className={`hidden md:flex flex-col items-center justify-center leading-tight gap-0 px-2 py-1.5 lg:px-3 lg:py-2 rounded-xl border border-gray-100 transition-all text-[11px] md:text-xs lg:text-sm xl:text-base font-black uppercase tracking-widest text-gray-600 hover:scale-105 active:scale-95 duration-200 shrink-0 ${
                  role === "seeker"
                    ? "hover:border-[#148F8B] hover:bg-[#148F8B]/5 hover:text-[#148F8B]"
                    : "hover:border-[#A63F8E] hover:bg-[#A63F8E]/5 hover:text-[#A63F8E]"
                }`}
              >
                <span>Switch to</span>
                <span>{role === "seeker" ? "Employer" : "Job Seeker"}</span>
              </button>
            )}
          </>
        )}

        {/* Auth Buttons */}
        {isLoggedIn ? (
          <button
            onClick={onLogout}
            className="h-9 md:h-10 xl:h-12 px-3 md:px-4 xl:px-6 text-xs md:text-sm xl:text-base hover:scale-105 active:scale-95 transition-all duration-200 rounded-2xl font-black text-white hover:opacity-90 whitespace-nowrap shrink-0"
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