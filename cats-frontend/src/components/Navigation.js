"use client";

import React from "react";
import Link from "next/link";
import { useLanguage } from "../contexts/LanguageContext";

export default function Navigation() {
  const { language, toggleLanguage, getLanguageDisplay, t, isLoading } =
    useLanguage();

  if (isLoading) {
    return (
      <nav className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-6xl px-6 py-4">
          <div className="animate-pulse flex items-center justify-between">
            <div className="h-10 w-48 bg-slate-200 rounded"></div>
            <div className="h-8 w-32 bg-slate-200 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-lg font-bold text-blue-600">C</span>
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">
              CATS {t("nav.home", "होम")}
            </h1>
          </Link>

          {/* Navigation Links & Language Switcher */}
          <div className="flex items-center space-x-6">
            {/* Navigation Links */}
            <div className="hidden items-center space-x-4 md:flex">
              <Link
                href="/"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-800"
              >
                {t("nav_home")}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-800"
              >
                {t("nav_dashboard")}
              </Link>
              <Link
                href="/auth/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-800"
              >
                {t("nav_login")}
              </Link>
            </div>

            {/* 3-Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-2 rounded-md bg-slate-100 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-200 border border-slate-300"
              title="Click to switch language (English → हिंदी → मराठी)"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
              <span className="min-w-16 text-center">
                {getLanguageDisplay()}
              </span>
              <svg
                className="h-3 w-3 opacity-60"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Mobile Menu Button */}
            <button className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-800 md:hidden">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
