import { useState } from "react";
import { Settings as SettingsIcon, Menu, X, MessageSquare, LayoutDashboard, Briefcase, Users, PlusSquare, Info, LogOut } from "lucide-react";
import hanaHireLogo from '../../assets/hanahire-logo.png';

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
  onLogout,
  onShowAuth,
  onReset,
  isPaymentModalOpen = false,
  isDemoAccount = false,
  totalUnreadMessages = 0,
}: HeaderProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const accentColor = !isRoleSelected ? '#A63F8E' : role === 'seeker' ? '#148F8B' : '#A63F8E';

  const borderStyle = !isRoleSelected
    ? 'linear-gradient(to right, #148F8B, #A63F8E)'
    : role === 'seeker'
      ? '#148F8B'
      : '#A63F8E';

  if (isPaymentModalOpen) {
    return null;
  }

  const closeMobile = () => setMobileMenuOpen(false);

  const handleNavigate = (view: ViewType) => {
    onNavigate(view);
    closeMobile();
  };

  const handleReset = () => {
    onReset();
    closeMobile();
  };

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-200 ${
      active ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`;

  return (
    <>
      {/* ── Desktop Header ── */}
      <nav
        className="hidden md:flex sticky top-0 z-40 px-4 md:px-5 lg:px-6 xl:px-8 h-20 items-center justify-between gap-2 transition-colors duration-200 relative"
        style={{ backgroundColor: '#FAF9F7' }}
      >
        {/* Bottom border */}
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
            className="shrink-0 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <img src={hanaHireLogo} alt="HanaHire" className="h-10 md:h-12 w-auto" />
          </button>

          {isRoleSelected ? (
            <div className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-12 flex-nowrap shrink min-w-0">
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
        <div className="flex items-center gap-4 md:gap-5 lg:gap-6 shrink-0">
          {isLoggedIn ? (
            <button
              onClick={onLogout}
              className="h-9 md:h-10 xl:h-12 px-3 md:px-4 xl:px-6 text-xs md:text-sm xl:text-base hover:scale-105 active:scale-95 transition-all duration-200 rounded-2xl font-black text-white hover:opacity-90 whitespace-nowrap shrink-0"
              style={{ backgroundColor: '#A63F8E' }}
            >
              Sign Out
            </button>
          ) : (
            <div className="flex gap-2 sm:gap-3">
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

      {/* ── Mobile Header Bar ── */}
      <nav
        className="flex md:hidden sticky top-0 z-40 px-4 h-14 items-center justify-between relative"
        style={{ backgroundColor: '#FAF9F7' }}
      >
        {/* Bottom border */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: borderStyle,
          transition: 'background 0.4s ease',
        }} />

        {/* Logo */}
        <button onClick={handleReset} className="shrink-0 active:scale-95 transition-transform">
          <img src={hanaHireLogo} alt="HanaHire" className="h-8 w-auto" />
        </button>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {!isLoggedIn && (
            <>
              <button
                onClick={() => onShowAuth("login")}
                className="h-9 px-3 text-sm font-black text-white rounded-xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#A63F8E' }}
              >
                Log In
              </button>
              <button
                onClick={() => onShowAuth("signup")}
                className="h-9 px-3 text-sm font-black text-white rounded-xl active:scale-95 transition-transform"
                style={{ backgroundColor: '#148F8B' }}
              >
                Sign Up
              </button>
            </>
          )}

          {/* Messages icon with badge when logged in and role selected */}
          {isLoggedIn && isRoleSelected && (
            <button
              onClick={() => handleNavigate("messages")}
              className="relative w-10 h-10 flex items-center justify-center rounded-xl active:scale-95 transition-transform"
              style={{ color: accentColor }}
            >
              <MessageSquare size={22} />
              {totalUnreadMessages > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 flex items-center justify-center text-white rounded-full"
                  style={{ background: '#ef4444', fontSize: '9px', fontWeight: 900 }}>
                  {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                </span>
              )}
            </button>
          )}

          {/* Hamburger — shown when role is selected OR logged in */}
          {(isRoleSelected || isLoggedIn) && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl active:scale-95 transition-transform text-gray-700"
            >
              <Menu size={24} />
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile Drawer Overlay ── */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={closeMobile}
          />

          {/* Drawer panel */}
          <div
            className="relative ml-auto w-72 max-w-[85vw] h-full flex flex-col shadow-2xl overflow-y-auto bg-white"
          >
            {/* Drawer header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <img src={hanaHireLogo} alt="HanaHire" className="h-8 w-auto" />
              <button
                onClick={closeMobile}
                className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
              >
                <X size={22} />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 px-3 py-4 space-y-1">
              {isLoggedIn && isRoleSelected && (
                <button
                  onClick={() => handleNavigate(role === "seeker" ? "seeker" : "employer")}
                  className={navLinkClass(currentTab === "seeker" || currentTab === "employer")}
                >
                  <LayoutDashboard size={18} /> Dashboard
                </button>
              )}

              {isLoggedIn && isRoleSelected && (
                <button
                  onClick={() => handleNavigate("messages")}
                  className={navLinkClass(currentTab === "messages")}
                >
                  <MessageSquare size={18} />
                  Messages
                  {totalUnreadMessages > 0 && (
                    <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full text-white text-[10px] font-black bg-red-500">
                      {totalUnreadMessages > 9 ? '9+' : totalUnreadMessages}
                    </span>
                  )}
                </button>
              )}

              {role === "seeker" && isRoleSelected && (
                <button
                  onClick={() => handleNavigate("jobs")}
                  className={navLinkClass(currentTab === "jobs")}
                >
                  <Briefcase size={18} /> Browse Jobs
                </button>
              )}

              {role === "employer" && isRoleSelected && (
                <>
                  <button
                    onClick={() => handleNavigate("job-posting")}
                    className={navLinkClass(currentTab === "job-posting")}
                  >
                    <PlusSquare size={18} /> Post a Job
                  </button>
                  <button
                    onClick={() => handleNavigate("candidates")}
                    className={navLinkClass(currentTab === "candidates")}
                  >
                    <Users size={18} /> Find Talent
                  </button>
                </>
              )}

              <button
                onClick={() => handleNavigate("about")}
                className={navLinkClass(currentTab === "about")}
              >
                <Info size={18} /> About
              </button>

              {isLoggedIn && isRoleSelected && (
                <button
                  onClick={() => handleNavigate("settings")}
                  className={navLinkClass(currentTab === "settings")}
                >
                  <SettingsIcon size={18} /> Settings
                </button>
              )}
            </div>

            {/* Bottom actions */}
            <div className="px-3 pb-20 pt-2 border-t border-gray-100 space-y-2">
              {isLoggedIn ? (
                <button
                  onClick={() => { onLogout(); closeMobile(); }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-widest text-white hover:opacity-90 transition-all"
                  style={{ backgroundColor: '#A63F8E' }}
                >
                  <LogOut size={18} /> Sign Out
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => { onShowAuth("login"); closeMobile(); }}
                    className="flex-1 py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#A63F8E' }}
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { onShowAuth("signup"); closeMobile(); }}
                    className="flex-1 py-3 rounded-xl text-sm font-black text-white hover:opacity-90 transition-all"
                    style={{ backgroundColor: '#148F8B' }}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
