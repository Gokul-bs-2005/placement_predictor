import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../services/api/auth";
import { motion } from "framer-motion";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      alert("Signup successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-100 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <motion.form initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-premium dark:bg-slate-900 dark:text-white">
        <h1 className="text-3xl font-extrabold">Create Account</h1>
        <p className="mb-6 text-slate-500">Start predicting placement chances</p>

        <input className="mb-3 w-full rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-800" placeholder="Name"
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="mb-3 w-full rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-800" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="mb-5 w-full rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-800" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <button className="w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white">Signup</button>
        <p className="mt-4 text-center">Already have account? <Link className="text-emerald-600" to="/login">Login</Link></p>
      </motion.form>
    </div>
  );
}
