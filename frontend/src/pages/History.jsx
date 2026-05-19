import React, { useEffect, useState } from "react";
import { getHistory } from "../services/api/prediction";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getHistory()
      .then((res) => setHistory(res.data.history || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="rounded-3xl bg-white p-6 shadow-premium dark:bg-slate-900">
      <h2 className="mb-5 text-2xl font-bold">My Prediction History</h2>

      {loading ? (
        <div className="rounded-2xl bg-slate-100 p-10 text-center text-slate-500 dark:bg-slate-800">
          Loading...
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl bg-slate-100 p-10 text-center text-slate-500 dark:bg-slate-800">
          No history yet. Make a prediction to see it here.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {history.map((item, i) => (
            <div
              key={item.id || i}
              className="rounded-3xl border p-5 transition hover:shadow-md dark:border-slate-800"
            >
              <h3 className="text-lg font-bold">{item.student_name}</h3>
              <p className="mt-1 text-sm text-slate-500">
                CGPA: {item.cgpa} &nbsp;|&nbsp; Technical: {item.technical_skills}
              </p>
              <p
                className={`mt-3 inline-block rounded-full px-3 py-1 text-sm text-white ${
                  item.result === "Placed" ? "bg-emerald-500" : "bg-red-500"
                }`}
              >
                {item.result} — {item.confidence}%
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
