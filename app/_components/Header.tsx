'use client';

import { useEffect, useRef } from 'react';
import { FaBars, FaBell, FaSearch, FaUserCircle, FaCog } from 'react-icons/fa';
import gsap from 'gsap';

// Header Component
export function Header() {
  const headerRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (headerRef.current) {
      gsap.from(headerRef.current, {
        y: -20,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.out'
      });
    }
  }, []);

  const handleSearchFocus = () => {
    if (searchRef.current) {
      gsap.to(searchRef.current, {
        scale: 1.02,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  };

  const handleSearchBlur = () => {
    if (searchRef.current) {
      gsap.to(searchRef.current, {
        scale: 1,
        duration: 0.2,
        ease: 'power2.in'
      });
    }
  };

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm"
    >
      <div className="px-4 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Menu + Search */}
          <div className="flex items-center gap-4 flex-1">
            {/* Mobile Menu Button */}
            <button
              onClick={() => window.toggleSidebar?.()}
              className="lg:hidden p-2.5 text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 active:scale-95 hover:scale-105"
            >
              <FaBars className="text-xl" />
            </button>

            {/* Search Bar */}
            <div
              ref={searchRef}
              className="hidden md:flex items-center gap-3 bg-slate-100 rounded-xl px-4 py-2.5 flex-1 max-w-md transition-all duration-200"
            >
              <FaSearch className="text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className="bg-transparent border-none outline-none text-slate-700 placeholder-slate-400 w-full"
              />
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <button className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
              <FaSearch className="text-lg" />
            </button>

            {/* Notifications */}
            <button className="relative p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
              <FaBell className="text-lg" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            {/* Settings */}
            <button className="hidden sm:block p-2.5 text-slate-600 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
              <FaCog className="text-lg" />
            </button>

            {/* User Profile */}
            <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                A
              </div>
              <span className="hidden lg:block text-sm font-medium text-slate-700">Admin</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
