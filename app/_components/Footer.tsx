"use client"
import Link from "next/link";
import { useEffect, useRef } from "react";

// Footer Component
export function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && footerRef.current) {
            gsap.from(footerRef.current.children, {
              y: 20,
              opacity: 0,
              duration: 0.6,
              stagger: 0.1,
              ease: 'power3.out'
            });
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 lg:py-12">
        <div ref={footerRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <h3 className="text-xl font-bold">Dashboard</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Manage your business efficiently with our comprehensive management system.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/orders" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  Orders
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/customers" className="text-slate-400 hover:text-white transition-colors duration-200 text-sm">
                  Customers
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            © {new Date().getFullYear()} Dashboard. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}