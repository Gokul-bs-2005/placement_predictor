import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Bot, GraduationCap, LayoutDashboard, Moon, Search, Sun, Users, History, LogOut } from "lucide-react";
import Chatbot from "./Chatbot";
import Notification from "./Notification";

export default function Layout({ dark, setDark }) {
  const navigate = useNavigate();
  const [cursor, setCursor] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const move = (e) => setCursor({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const links = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/predict", label: "Predict", icon: GraduationCap },
    { to: "/students", label: "Students", icon: Users },
    { to: "/history", label: "History", icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="custom-cursor hidden md:block" style={{ left: cursor.x, top: cursor.y }} />
      <Notification />

      <aside className="fixed left-0 top-0 hidden h-full w-72 border-r border-slate-200 bg-white/80 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 lg:block">
        <div className="mb-10 flex items-center gap-3">
          <div className="rounded-2xl bg-emerald-500 p-3 text-white">
            <Bot />
          </div>
          <div>
            <h1 className="text-xl font-bold">Placement AI</h1>
            <p className="text-sm text-slate-500">Resume worthy ML app</p>
          </div>
        </div>

        <nav className="space-y-3">
          {links.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 rounded-2xl px-4 py-3 font-medium hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-800">
              <Icon size={20} /> {label}
            </Link>
          ))}
        </nav>

        <button onClick={logout} className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 text-white">
          <LogOut size={18} /> Logout
        </button>
      </aside>

      <main className="lg:ml-72">
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 md:px-8">
          <div>
            <h2 className="text-lg font-bold md:text-2xl">Student Placement Prediction System</h2>
            <p className="hidden text-sm text-slate-500 md:block">Logistic Regression + Random Forest + Flask + React</p>
          </div>

          <button onClick={() => setDark(!dark)} className="rounded-full bg-slate-200 p-3 dark:bg-slate-800">
            {dark ? <Sun /> : <Moon />}
          </button>
        </header>

        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t bg-white p-2 dark:border-slate-800 dark:bg-slate-900 lg:hidden">
        {links.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} className="flex flex-col items-center text-xs">
            <Icon size={20} /> {label}
          </Link>
        ))}
      </div>

      <Chatbot />
    </div>
  );
}
