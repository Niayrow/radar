import React from "react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-950 via-slate-900 to-cyan-900 flex flex-col items-center justify-center p-4 text-white">
      <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center max-w-md w-full">
        <h1 className="text-6xl font-extrabold text-cyan-400 mb-2">404</h1>
        <h2 className="text-xl font-bold mb-4">Page non trouvée</h2>
        <p className="text-sm text-white/70 mb-6">
          Désolé, l&apos;univers météo n&apos;a pas trouvé cette page.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 font-semibold text-sm transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
        >
          Retour au Dashboard
        </Link>
      </div>
    </div>
  );
}
