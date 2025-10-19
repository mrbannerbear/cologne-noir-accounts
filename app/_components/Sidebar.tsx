"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaBox,
  FaUsers,
  FaShoppingCart,
  FaChartLine,
  FaTimes,
} from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";

declare global {
  interface Window {
    toggleSidebar?: () => void;
  }
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navRefs = useRef<HTMLDivElement[]>([]);

  const navItems = [
    {
      name: "Orders",
      href: "/orders",
      icon: FaShoppingCart,
      gradient: "from-blue-500 to-indigo-500",
      activeGradient: "from-blue-600 to-indigo-600",
    },
    {
      name: "Products",
      href: "/products",
      icon: FaBox,
      gradient: "from-purple-500 to-fuchsia-500",
      activeGradient: "from-purple-600 to-fuchsia-600",
    },
    {
      name: "Customers",
      href: "/customers",
      icon: FaUsers,
      gradient: "from-teal-500 to-cyan-500",
      activeGradient: "from-teal-600 to-cyan-600",
    },
  ];

  // Expose toggle function globally
  useEffect(() => {
    window.toggleSidebar = () => setIsOpen((prev) => !prev);
    return () => {
      delete window.toggleSidebar;
    };
  }, []);

  // Animate nav items on mount
  useEffect(() => {
    navRefs.current.forEach((el, i) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateX(-20px)";
        setTimeout(() => {
          if (el) {
            el.style.transition = "all 0.3s ease-out";
            el.style.opacity = "1";
            el.style.transform = "translateX(0)";
          }
        }, 100 + i * 100);
      }
    });
  }, []);

  return (
    <>
      {/* Mobile Overlay */}
      <div className={`fixed bg-black/50 w-full h-full top-0 left-0 z-10 ${isOpen ? "block" : "hidden"} lg:hidden`}
        onClick={() => setIsOpen(false)}
      ></div>
      <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200">
        <button onClick={() => setIsOpen(!isOpen)}>
          <GiHamburgerMenu size={18} />
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-50 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          flex flex-col
        `}
      >
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-200">
          <div className="font-bold text-lg">Menu</div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            <FaTimes size={18} />
          </button>
        </div>

        {/* Logo (desktop + mobile) */}
        <div className="p-6 border-b border-slate-200 hidden lg:flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
            <FaChartLine className="text-white text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Business Manager
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <div
                key={item.href}
                ref={(el) => {
                  if (el) navRefs.current[index] = el;
                }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    relative flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300
                    ${
                      isActive
                        ? `bg-gradient-to-r ${item.activeGradient} text-white shadow-lg scale-105`
                        : "text-slate-700 hover:bg-slate-100 hover:scale-102"
                    }
                  `}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                  <div
                    className={`
                    p-2 rounded-lg transition-all duration-300
                    ${
                      isActive
                        ? "bg-white bg-opacity-20"
                        : `bg-gradient-to-br ${item.gradient} bg-opacity-10 group-hover:bg-opacity-20`
                    }
                  `}
                  >
                    <Icon
                      className={`text-lg transition-all duration-300 ${
                        isActive
                          ? "text-white"
                          : "text-slate-700 group-hover:scale-110"
                      }`}
                    />
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </Link>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
