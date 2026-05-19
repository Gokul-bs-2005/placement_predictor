import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Notification() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail);
      setTimeout(() => setMessage(""), 2500);
    };
    window.addEventListener("notify", handler);
    return () => window.removeEventListener("notify", handler);
  }, []);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-5 right-5 z-50 rounded-2xl bg-emerald-600 px-5 py-3 text-white shadow-premium"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
