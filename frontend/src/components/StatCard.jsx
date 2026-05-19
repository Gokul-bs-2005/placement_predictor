import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon }) {
  return (
    <motion.div whileHover={{ y: -5 }} className="rounded-3xl bg-white p-6 shadow-premium dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-slate-500">{title}</h3>
        {Icon && <Icon className="text-emerald-500" />}
      </div>
      <p className="text-3xl font-extrabold">{value}</p>
    </motion.div>
  );
}
