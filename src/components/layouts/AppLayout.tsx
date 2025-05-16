"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserButton } from "../ui/user-button";
import { Menu, X } from "lucide-react";
import { Button } from "../ui/button";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5" />
                <path d="M8.5 8.5v.01" />
                <path d="M16 12v.01" />
                <path d="M12 16v.01" />
              </svg>
              <span className="hidden sm:inline">Compatibility Matrix</span>
              <span className="sm:hidden">Matrix</span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary"
              >
                Dashboard
              </Link>
              <Link
                href="/assessment"
                className="text-sm font-medium hover:text-primary"
              >
                Assessment
              </Link>
              <Link
                href="/matrix"
                className="text-sm font-medium hover:text-primary"
              >
                Matrix
              </Link>
              <Link
                href="/connections"
                className="text-sm font-medium hover:text-primary"
              >
                Connections
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium hover:text-primary"
              >
                Profile
              </Link>
              <Link
                href="/biometrics"
                className="text-sm font-medium hover:text-primary"
              >
                Biometrics
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <UserButton />
            <button
              className="md:hidden p-2 rounded-md hover:bg-gray-100"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 px-4 border-t">
            <nav className="flex flex-col space-y-3 py-3">
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                href="/assessment"
                className="text-sm font-medium hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Assessment
              </Link>
              <Link
                href="/matrix"
                className="text-sm font-medium hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Matrix
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium hover:text-primary py-2 px-3 rounded-md hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                Profile
              </Link>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row text-center md:text-left">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Compatibility Matrix. All rights
            reserved.
          </p>
          <nav className="flex gap-4 flex-wrap justify-center">
            <Link
              href="/privacy"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Terms
            </Link>
            <Link
              href="/contact"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
