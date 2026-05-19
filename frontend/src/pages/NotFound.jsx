import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 p-4 text-center dark:bg-slate-950 dark:text-white">
      <div className="rounded-3xl bg-white p-10 shadow-premium dark:bg-slate-900">
        <h1 className="text-6xl font-extrabold">404</h1>
        <p className="my-4 text-slate-500">Page not found</p>
        <Link className="rounded-2xl bg-emerald-500 px-5 py-3 text-white" to="/">Go Home</Link>
      </div>
    </div>
  );
}
