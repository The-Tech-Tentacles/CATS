"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "../utils/api";
import { useLanguage } from "../contexts/LanguageContext";
import Navigation from "../components/Navigation";

export default function HomePage() {
  const { language, toggleLanguage, getLanguageDisplay, t, isLoading } =
    useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Test backend connection on page load
  useEffect(() => {
    const testConnection = async () => {
      try {
        await api.get("/api/health");
        setIsConnected(true);
      } catch (error) {
        console.log("Backend not connected:", error);
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navigation />

      {/* Connection Status */}
      <div className="border-b border-slate-200 bg-white py-2">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-end space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${isConnected ? "bg-green-400" : "bg-red-400"}`}
            ></div>
            <span className="text-sm text-slate-600">{t("loading")}</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-800">
            {t("home_welcome")}
          </h2>
          <p className="text-xl font-medium text-blue-600 mb-4">
            {t("home_subtitle")}
          </p>
          <p className="mx-auto mb-8 max-w-4xl text-xl leading-relaxed text-slate-600">
            {t("home_description")}
          </p>
        </div>

        {/* Main Action Buttons - Large and Easy to See */}
        <div className="mb-16 grid gap-8 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <svg
                  className="h-8 w-8 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-800">
                {t(
                  "",
                  "File New Complaint",
                  "नई शिकायत दर्ज करें",
                  "नवीन तक्रार दाखल करा"
                )}
              </h3>
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                {t(
                  "",
                  "Submit your cyber crime complaint with all necessary details and evidence",
                  "सभी आवश्यक विवरण और साक्ष्य के साथ अपनी साइबर अपराध शिकायत दर्ज करें",
                  "सर्व आवश्यक तपशील आणि पुराव्यासह तुमची सायबर गुन्हा तक्रार सादर करा"
                )}
              </p>
              <Link
                href="/auth/login"
                className="inline-block rounded-xl bg-blue-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-blue-600"
              >
                {t(
                  "",
                  "Start New Complaint",
                  "नई शिकायत शुरू करें",
                  "नवीन तक्रार सुरू करा"
                )}
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              </div>
              <h3 className="mb-4 text-2xl font-bold text-slate-800">
                शिकायत की स्थिति देखें
                <br />
                <span className="text-lg font-medium">
                  Track Complaint Status
                </span>
              </h3>
              <p className="mb-6 text-lg leading-relaxed text-slate-600">
                Check the current status and progress of your submitted
                complaints
              </p>
              <Link
                href="/auth/login"
                className="inline-block rounded-xl bg-green-500 px-8 py-4 text-lg font-semibold text-white shadow-md transition-colors hover:bg-green-600"
              >
                Track Status
              </Link>
            </div>
          </div>
        </div>

        {/* Information Section */}
        <div className="mb-12 rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <h2 className="mb-8 text-center text-2xl font-bold text-slate-800">
            How to Use This System
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-slate-800">
                Register/Login
              </h3>
              <p className="text-slate-600">
                Create an account or login with your credentials
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-slate-800">
                File Complaint
              </h3>
              <p className="text-slate-600">
                Fill out the complaint form with all details
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-slate-800">
                Track Progress
              </h3>
              <p className="text-slate-600">
                Monitor the status of your complaint
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="rounded-xl bg-slate-800 p-8 text-white shadow-lg">
          <div className="text-center">
            <h2 className="mb-4 text-2xl font-bold">Need Help?</h2>
            <p className="mb-6 text-lg text-slate-300">
              Contact our support team for assistance
            </p>
            <div className="flex flex-col items-center justify-center gap-6 md:flex-row">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <span className="text-lg">100 (Police Helpline)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-lg">cybercrime@police.gov.in</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
