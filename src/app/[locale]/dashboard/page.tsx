"use client";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-orange-100">
      <header className="w-full max-w-2xl mx-auto flex flex-col items-center py-10">
        <div className="rounded-full bg-orange-500 w-16 h-16 flex items-center justify-center mb-4 shadow-lg">
          <span className="text-3xl text-white font-bold">🏀</span>
        </div>
        <h1 className="text-3xl font-extrabold text-blue-900 mb-2">
          Welcome, Coach!
        </h1>
        <p className="text-gray-700 mb-6 text-center max-w-md">
          Here you can manage your basketball teams and training plans.
        </p>
        <Link
          href="#"
          className="px-6 py-2 rounded-full bg-orange-500 text-white text-lg font-semibold shadow-md hover:bg-orange-600 transition mb-8"
        >
          + Create New Team
        </Link>
      </header>
      <main className="w-full max-w-2xl mx-auto flex-1">
        <section className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Your Teams</h2>
          <div className="text-gray-500 text-center py-8">
            {/* Placeholder for teams list */}
            No teams yet. Start by creating a new team!
          </div>
        </section>
      </main>
    </div>
  );
}
