// src/components/Header/Header.tsx

import React, { useState, useEffect, useRef } from "react";
import {
  StatusIndicatorCard,
  SimpleStatus,
} from "@/components/Header/StatusIndicatorCard";
import { SupportContactCard } from "@/components/Header/SupportContactCard";
import { MenuIcon, XMarkIcon } from "@/components/Icons/Icons";
import { appConfig } from "@/components/config/appConfig";

// --- End of Placeholder Components ---

const CUSTOM_HEADER_HEIGHT = "6rem"; // Reduced from 12rem

interface HeaderProps {
  onSettingsClick: () => void;
  currentView: "main" | "settings";
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSettingsClick,
  currentView,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  // Clamp any string to our three allowed statuses
  const clampStatus = (s: string): SimpleStatus => {
    if (s === "connected") return "connected";
    if (s === "error") return "error";
    // Everything else becomes "offline"
    return "offline";
  };

  type SimpleStatus = "connected" | "error" | "offline";

  // Initialize each indicator to a SimpleStatus
  const [scanner1Status, setScanner1Status] = useState<SimpleStatus>(
    clampStatus(appConfig.initialStatuses.scanner1)
  );
  const [scanner2Status, setScanner2Status] = useState<SimpleStatus>(
    clampStatus(appConfig.initialStatuses.scanner2)
  );
  const [serverStatus, setServerStatus] = useState<SimpleStatus>(
    clampStatus(appConfig.initialStatuses.server)
  );

  // Track window width (for responsive hiding)
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);

  // State and ref for auto-hiding header on scroll
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);


  // Demo mode: randomly flip between connected/error/offline
  useEffect(() => {
    if (!appConfig.demoMode.enabled) return;

    const statuses: SimpleStatus[] = ["connected", "error", "offline"];
    const getRandomStatus = (): SimpleStatus =>
      statuses[Math.floor(Math.random() * statuses.length)];

    const { initialDelay, statusChangeIntervals } = appConfig.demoMode;

    // Schedule initial updates
    const initialTimers = [
      setTimeout(() => setScanner1Status(getRandomStatus()), initialDelay.scanner1),
      setTimeout(() => setScanner2Status(getRandomStatus()), initialDelay.scanner2),
      setTimeout(() => setServerStatus(getRandomStatus()), initialDelay.server),
    ];

    // Schedule recurring updates
    const intervalTimers = [
      setInterval(() => setScanner1Status(getRandomStatus()), statusChangeIntervals.scanner1),
      setInterval(() => setScanner2Status(getRandomStatus()), statusChangeIntervals.scanner2),
      setInterval(() => setServerStatus(getRandomStatus()), statusChangeIntervals.server),
    ];

    return () => {
      initialTimers.forEach(clearTimeout);
      intervalTimers.forEach(clearInterval);
    };
  }, []);

  // Effect for client-side logic: window listeners (resize and scroll)
  useEffect(() => {
    setIsClient(true);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY.current || currentScrollY <= 10) {
        setIsHeaderVisible(true);
      } else {
        setIsHeaderVisible(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); 

  if (appConfig.hideHeader) return null;

  const widgetsDynamicClass =
    isClient &&
    currentView === "main" &&
    isSidebarOpen &&
    windowWidth < 1280 &&
    windowWidth > 0
      ? "hidden xl:flex"
      : "flex";

  const mainButtonText = currentView === "settings" ? "Dashboard" : "Settings";

  return (
    <header
      className={`w-full bg-slate-100 dark:bg-slate-900 shadow-lg sticky top-0 z-30 transition-transform duration-300 ease-in-out ${isHeaderVisible ? "translate-y-0" : "-translate-y-full"}`}
      style={{ height: CUSTOM_HEADER_HEIGHT }}
    >
      <div className="flex items-center justify-between w-full h-full px-4 sm:px-6 md:px-8">
        <div className="flex items-center flex-shrink-0 h-full">
          {currentView === "main" && (
            <button
              onClick={onToggleSidebar}
              className="p-2 mr-2 md:mr-4 text-slate-700 dark:text-slate-200 hover:text-sky-600 dark:hover:text-sky-400 focus:outline-none rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"
              aria-label={isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
            >
              {isSidebarOpen ? (
                <XMarkIcon className="w-8 h-8" />
              ) : (
                <MenuIcon className="w-8 h-8" />
              )}
            </button>
          )}

          <div className={`items-stretch h-full py-3 space-x-4 ${widgetsDynamicClass}`}>
            <SupportContactCard supportInfo={appConfig.callSupportInfo} />
          </div>
        </div>

        <div className="flex items-center ml-auto flex-shrink-0">
          <button
            type="button"
            aria-label={mainButtonText}
            className="flex items-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-wider text-sky-100 dark:text-sky-100 bg-sky-600 hover:bg-sky-700 dark:bg-sky-700 dark:hover:bg-sky-600 rounded-xl shadow-xl hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-sky-400 dark:focus:ring-sky-500 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
            onClick={onSettingsClick}
          >
            {mainButtonText}
          </button>
        </div>
      </div>
      
      <style>
        {`
          @keyframes pulse-red {
            0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
          }
          .animate-pulse-red {
            animation: pulse-red 2s infinite cubic-bezier(0.66, 0, 0, 1);
          }
        `}
      </style>
    </header>
  );
};

// Default export for usage in other files
export default Header;
