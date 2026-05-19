import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../services/api/auth";
import { notify } from "../utils/toast";
import { motion } from "framer-motion";

export default function Login({ dark, setDark }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.token);
      notify("Login successful");
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-emerald-100 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <motion.form initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} onSubmit={submit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-premium dark:bg-slate-900 dark:text-white">
        <h1 className="text-3xl font-extrabold">Welcome Back</h1>
        <p className="mb-6 text-slate-500">Login to Placement Predictor AI</p>

        <input className="mb-3 w-full rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-800" placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input type="password" className="mb-5 w-full rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-800" placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })} />

        <button className="w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white">Login</button>
        <p className="mt-4 text-center">New user? <Link className="text-emerald-600" to="/signup">Create account</Link></p>
      </motion.form>
    </div>
  );
}
