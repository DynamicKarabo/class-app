import { useState } from "react";
import { Plus, Trash2, Users, Calendar, Download, Shuffle } from "lucide-react";

export default function ClassMonitoringApp() {
  const [students, setStudents] = useState([
    { id: 1, name: "Peter", present: true, date: new Date().toLocaleDateString() },
    { id: 2, name: "John", present: false, date: new Date().toLocaleDateString() },
  ]);
  const [newName, setNewName] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const toggleAttendance = (id: number) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, present: !s.present, date: new Date().toLocaleDateString() }
          : s
      )
    );
  };

  const addStudent = () => {
    if (!newName.trim()) return;
    setStudents((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newName.trim(),
        present: false,
        date: new Date().toLocaleDateString(),
      },
    ]);
    setNewName("");
  };

  const deleteStudent = (id: number) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    if (selectedStudentId === id) setSelectedStudentId(null);
  };

  const exportToCSV = () => {
    const headers = ["Name", "Status", "Last Updated"];
    const rows = students.map((s) => [
      s.name,
      s.present ? "Present" : "Absent",
      s.date,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers, ...rows].map((row) => row.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const pickRandomStudent = () => {
    const presentStudents = students.filter((s) => s.present);
    if (presentStudents.length === 0) {
      alert("No students marked as present yet!");
      return;
    }
    const randomIndex = Math.floor(Math.random() * presentStudents.length);
    const picked = presentStudents[randomIndex];
    setSelectedStudentId(picked.id);

    // Lightweight confetti effect (no external deps)
    const colors = ["#f56565", "#48bb78", "#2c6cff", "#ed8936", "#9f7aea"]; // Updated color mix
    const confettiContainer = document.createElement("div");
    confettiContainer.style.position = "fixed";
    confettiContainer.style.top = "0";
    confettiContainer.style.left = "0";
    confettiContainer.style.width = "100%";
    confettiContainer.style.height = "100%";
    confettiContainer.style.pointerEvents = "none";
    confettiContainer.style.zIndex = "9999";
    document.body.appendChild(confettiContainer);

    for (let i = 0; i < 80; i++) {
      const confetti = document.createElement("div");
      confetti.style.position = "absolute";
      confetti.style.width = "10px";
      confetti.style.height = "10px";
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.top = "-10px";
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.animation = "fall 3s linear forwards";
      confettiContainer.appendChild(confetti);
    }

    const style = document.createElement("style");
    style.textContent = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    setTimeout(() => {
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 3000);
  };

  const presentCount = students.filter((s) => s.present).length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header - Changed to include "EduTrack" and logo feel */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
             {/* Replace with an actual image tag for the logo if possible, using a Lucide icon as placeholder */}
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-graduation-cap"><path d="M21.42 10.976a2 2 0 0 0-.251-.43l-8-5.5.01-.01a2 2 0 0 0-2.348-.002l-8 5.5a2 2 0 0 0 0 3.107l8 5.5.01-.01a2 2 0 0 0 2.348-.002l8-5.5a2 2 0 0 0 0-3.107v0z"/><path d="M12 4v16"/><path d="M3.46 11.08l8.5 5.5 8.5-5.5"/></svg>
            <h1 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100">
              EduTrack
            </h1>
          </div>
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300">
            Class Monitoring Dashboard
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>

        {/* Stats Card - Cleaner card background and more focus on numbers */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/50">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{students.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Present Today</p>
              <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{presentCount}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons - Using brand blue and secondary green/teal for variety */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={exportToCSV}
            // Primary Brand Blue
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={pickRandomStudent}
            // Accent Color (Teal/Green for contrast, often used in professional apps)
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl"
          >
            <Shuffle className="w-5 h-5" />
            Pick Random
          </button>
        </div>

        {/* Add Student - Clean input with brand button */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStudent()}
              placeholder="Enter student name..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addStudent}
              // Primary Brand Blue
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Class Roster</h2>
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <Users className="w-8 h-8 mx-auto mb-3" />
              <p className="font-medium">No students yet. Add one above to start tracking!</p>
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex items-center justify-between transition-all duration-300 border border-gray-100 dark:border-gray-700 ${
                  selectedStudentId === student.id
                    ? "ring-4 ring-blue-400 scale-[1.03] shadow-2xl" // Use brand blue for highlight
                    : "hover:shadow-xl hover:translate-y-[-2px]"
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {student.name}
                    {selectedStudentId === student.id && " 🎉"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Last attendance update: {student.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAttendance(student.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-white shadow-md transition-all transform hover:scale-105 min-w-[100px] ${
                      student.present
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {student.present ? "Present" : "Absent"}
                  </button>
                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
