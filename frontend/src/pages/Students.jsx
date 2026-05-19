import React, { useEffect, useState } from "react";
import { getStudents } from "../services/api/prediction";
import { Download } from "lucide-react";

export default function Students() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getStudents({ search, result: filter });
      setStudents(res.data.students || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [search, filter]);

  const exportCSV = () => {
    if (!students.length) return;
    const header = Object.keys(students[0]).join(",");
    const rows = students.map((s) => Object.values(s).join(",")).join("\n");
    const blob = new Blob([header + "\n" + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students_analytics.csv";
    link.click();
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-premium dark:bg-slate-900">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">Students</h2>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-white transition hover:bg-emerald-600"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student name..."
          className="rounded-2xl border px-4 py-3 outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-2xl border px-4 py-3 dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="All">All Results</option>
          <option value="Placed">Placed</option>
          <option value="Not Placed">Not Placed</option>
        </select>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-slate-100 p-10 text-center text-slate-500 dark:bg-slate-800">
          Loading...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl bg-slate-100 p-10 text-center text-slate-500 dark:bg-slate-800">
          No students found
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b dark:border-slate-800">
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">CGPA</th>
                <th className="p-3 font-semibold">Technical</th>
                <th className="p-3 font-semibold">Projects</th>
                <th className="p-3 font-semibold">Backlogs</th>
                <th className="p-3 font-semibold">Result</th>
                <th className="p-3 font-semibold">Confidence</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-b transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800">
                  <td className="p-3 font-medium">{s.student_name}</td>
                  <td className="p-3">{s.cgpa}</td>
                  <td className="p-3">{s.technical_skills}</td>
                  <td className="p-3">{s.projects}</td>
                  <td className="p-3">{s.backlogs}</td>
                  <td className="p-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                        s.result === "Placed" ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    >
                      {s.result}
                    </span>
                  </td>
                  <td className="p-3">{s.confidence}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
