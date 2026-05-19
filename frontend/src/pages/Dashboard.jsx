import React, { useEffect, useState } from "react";
import { getAnalytics } from "../services/api/prediction";
import StatCard from "../components/StatCard";
import Skeleton from "../components/Skeleton";
import { CheckCircle, UserCheck, UserX, Users } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    getAnalytics().then(res => setAnalytics(res.data.analytics)).catch(() => setAnalytics({ total: 0, placed: 0, not_placed: 0, placement_rate: 0 }));
  }, []);

  if (!analytics) {
    return <div className="grid gap-5 md:grid-cols-4"><Skeleton /><Skeleton /><Skeleton /><Skeleton /></div>;
  }

  return (
    <div className="space-y-8">
      <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 p-8 text-white shadow-premium">
        <h1 className="text-3xl font-extrabold md:text-5xl">AI Based Student Placement Predictor</h1>
        <p className="mt-3 max-w-2xl text-emerald-50">
          Predict placement chances using Logistic Regression and Random Forest with modern React dashboard.
        </p>
      </motion.section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Predictions" value={analytics.total} icon={Users} />
        <StatCard title="Placed" value={analytics.placed} icon={UserCheck} />
        <StatCard title="Not Placed" value={analytics.not_placed} icon={UserX} />
        <StatCard title="Placement Rate" value={`${analytics.placement_rate}%`} icon={CheckCircle} />
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-premium dark:bg-slate-900">
        <h2 className="mb-3 text-2xl font-bold">Project Highlights</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {["JWT Login System", "ML Model Integration", "PDF Report Download", "Search & Filter", "Responsive UI", "AI Chatbot Assistant"].map(item => (
            <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800" key={item}>{item}</div>
          ))}
        </div>
      </section>
    </div>
  );
}
