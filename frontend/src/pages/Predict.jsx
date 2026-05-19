import React, { useState } from "react";
import { predictPlacement, downloadReport } from "../services/api/prediction";
import { notify } from "../utils/toast";
import { motion } from "framer-motion";

const fields = [
  ["student_name", "Student Name", "text"],
  ["cgpa", "CGPA (0.0 - 10.0)", "number"],
  ["iq", "IQ Score", "number"],
  ["communication_skills", "Communication Skills (1-10)", "number"],
  ["projects", "Number of Projects", "number"],
  ["internship_experience", "Internship Experience (months)", "number"],
  ["aptitude", "Aptitude Score (1-10)", "number"],
  ["technical_skills", "Technical Skills (1-10)", "number"],
  ["backlogs", "Number of Backlogs", "number"],
  ["extracurricular_activities", "Extracurricular Activities (0 or 1)", "number"],
];

const initialForm = {
  student_name: "",
  cgpa: "",
  iq: "",
  communication_skills: "",
  projects: "",
  internship_experience: "",
  aptitude: "",
  technical_skills: "",
  backlogs: "",
  extracurricular_activities: "",
};

export default function Predict() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (key, type, value) => {
    setForm((prev) => ({
      ...prev,
      [key]: type === "number" ? value : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate all number fields are filled
    for (const [key, label, type] of fields) {
      if (type === "number" && (form[key] === "" || form[key] === null)) {
        setError(`Please fill in: ${label}`);
        return;
      }
    }

    // Build payload: convert numbers
    const payload = { ...form };
    for (const [key, , type] of fields) {
      if (type === "number") payload[key] = parseFloat(form[key]);
    }

    setLoading(true);
    try {
      const res = await predictPlacement(payload);
      if (res.data.success) {
        setResult(res.data);
        notify("Prediction completed!");
      } else {
        setError(JSON.stringify(res.data.errors || res.data.message));
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors;
      setError(typeof msg === "object" ? JSON.stringify(msg) : msg || "Prediction failed");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const payload = { ...form, result: result?.result, confidence: result?.confidence };
      const res = await downloadReport(payload);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "prediction_report.pdf");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      notify("Report downloaded!");
    } catch {
      setError("Failed to download report");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onSubmit={submit}
        className="rounded-3xl bg-white p-6 shadow-premium dark:bg-slate-900 xl:col-span-2"
      >
        <h2 className="mb-5 text-2xl font-bold">Predict Student Placement</h2>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-100 p-4 text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {fields.map(([key, label, type]) => (
            <label key={key} className="space-y-2">
              <span className="text-sm font-medium text-slate-500">{label}</span>
              <input
                type={type}
                value={form[key]}
                step="any"
                min={type === "number" ? "0" : undefined}
                onChange={(e) => handleChange(key, type, e.target.value)}
                required
                className="w-full rounded-2xl border px-4 py-3 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </label>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-2xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          {loading ? "Predicting..." : "Predict Placement"}
        </button>
      </motion.form>

      <div className="rounded-3xl bg-white p-6 shadow-premium dark:bg-slate-900">
        <h2 className="mb-4 text-2xl font-bold">Result</h2>
        {!result ? (
          <div className="rounded-2xl bg-slate-100 p-8 text-center text-slate-500 dark:bg-slate-800">
            Submit the form to see prediction
          </div>
        ) : (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="space-y-4">
            <div
              className={`rounded-3xl p-6 text-center text-white ${
                result.result === "Placed" ? "bg-emerald-500" : "bg-red-500"
              }`}
            >
              <p className="text-lg">Prediction</p>
              <h3 className="text-4xl font-extrabold">{result.result}</h3>
              <p className="mt-2 text-lg">Confidence: {result.confidence}%</p>
            </div>
            <button
              onClick={downloadPDF}
              className="w-full rounded-2xl bg-slate-900 py-3 font-medium text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Download PDF Report
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
