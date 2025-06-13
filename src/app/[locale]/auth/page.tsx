"use client";
import { useState } from "react";
import Link from "next/link";

export default function AuthPage() {
  const [tab, setTab] = useState<"signin" | "register">("signin");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-orange-100">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-lg p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <div className="rounded-full bg-orange-500 w-14 h-14 flex items-center justify-center mb-2 shadow">
            <span className="text-2xl text-white font-bold">🏀</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-900">
            Basketball Coach App
          </h2>
        </div>
        <div className="flex w-full mb-6">
          <button
            className={`flex-1 py-2 rounded-l-lg font-semibold transition ${
              tab === "signin"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-blue-700"
            }`}
            onClick={() => setTab("signin")}
          >
            Sign In
          </button>
          <button
            className={`flex-1 py-2 rounded-r-lg font-semibold transition ${
              tab === "register"
                ? "bg-blue-700 text-white"
                : "bg-gray-100 text-blue-700"
            }`}
            onClick={() => setTab("register")}
          >
            Register
          </button>
        </div>
        {tab === "signin" ? (
          <form className="w-full flex flex-col gap-4">
            <input
              type="email"
              placeholder="Email"
              className="border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="bg-orange-500 text-white py-2 rounded font-semibold hover:bg-orange-600 transition"
            >
              Sign In
            </button>
          </form>
        ) : (
          <form className="w-full flex flex-col gap-4">
            <input
              type="text"
              placeholder="Name"
              className="border rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              className="border rounded px-3 py-2"
            />
            <input
              type="password"
              placeholder="Password"
              className="border rounded px-3 py-2"
            />
            <button
              type="submit"
              className="bg-blue-700 text-white py-2 rounded font-semibold hover:bg-blue-800 transition"
            >
              Register
            </button>
          </form>
        )}
        <Link href="/" className="mt-6 text-blue-700 hover:underline text-sm">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
