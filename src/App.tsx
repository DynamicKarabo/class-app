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

    const encodedUri = encodeURI(csvContent.encodedUri);
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

    // Lightweight confetti effect without external library
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
      confetti.style.backgroundColor = ["#f00", "#0f0", "#00f", "#ff0", "#f0f"][Math.floor(Math.random() * 5)];
      confetti.style.left = Math.random() * 100 + "vw";
      confetti.style.top = "-10px";
      confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
      confetti.style.animation = "fall 3s linear forwards";
      confettiContainer.appendChild(confetti);
    }

    // Add simple fall animation
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

    // Clean up after animation
    setTimeout(() => {
      document.body.removeChild(confettiContainer);
      document.head.removeChild(style);
    }, 3000);
  };

  const presentCount = students.filter((s) => s.present).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950 py-8 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2">
            Class Monitoring
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            {today}
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{students.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Present Today</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{presentCount}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={exportToCSV}
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={pickRandomStudent}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg hover:shadow-xl"
          >
            <Shuffle className="w-5 h-5" />
            Pick Random
          </button>
        </div>

        {/* Add Student */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStudent()}
              placeholder="Enter student name..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addStudent}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 transition shadow-lg hover:shadow-xl"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No students yet. Add one above!
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex items-center justify-between transform transition-all ${
                  selectedStudentId === student.id
                    ? "ring-4 ring-purple-500 scale-105 shadow-2xl"
                    : "hover:scale-[1.02]"
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    {student.name}
                    {selectedStudentId === student.id && " 🎉"}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Last updated: {student.date}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleAttendance(student.id)}
                    className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 ${
                      student.present
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  >
                    {student.present ? "Present" : "Absent"}
                  </button>
                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition"
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
