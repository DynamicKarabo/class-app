import { useState } from "react";
import { Plus, Trash2, Users, Calendar } from "lucide-react";

export default function ClassMonitoringApp() {
  // SIMPLE DARK MODE STATE
  const [isDarkMode, setIsDarkMode] = useState(false);

  // SIMPLE TOGGLE FUNCTION
  const toggleDarkMode = () => {
    console.log("TOGGLE CLICKED! Current mode:", isDarkMode);
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Manually update body class
    if (newMode) {
      document.body.classList.add("dark-mode");
      console.log("Added dark-mode class to body");
    } else {
      document.body.classList.remove("dark-mode");
      console.log("Removed dark-mode class from body");
    }
  };

  const [students, setStudents] = useState([
    { id: 1, name: "Peter", present: true, date: new Date().toLocaleDateString() },
    { id: 2, name: "John", present: false, date: new Date().toLocaleDateString() },
  ]);

  const [newName, setNewName] = useState("");

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
  };

  const presentCount = students.filter((s) => s.present).length;

  return (
    <div className={`min-h-screen py-8 px-4 ${isDarkMode ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
      <div className="max-w-2xl mx-auto">
        {/* HEADER WITH DARK MODE BUTTON */}
        <div className="text-center mb-8 relative">
          {/* DARK MODE TOGGLE - SIMPLE BUT VISIBLE */}
          <button
            onClick={toggleDarkMode}
            className="absolute top-0 right-0 p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg z-50"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? "☀️ LIGHT" : "🌙 DARK"}
          </button>
          
          <h1 className={`text-4xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            Class Monitoring
          </h1>
          <p className={`text-lg flex items-center justify-center gap-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            <Calendar className="w-5 h-5" />
            {today}
          </p>
          
          {/* DEBUG TEXT - REMOVE LATER */}
          <p className="text-sm mt-2 text-red-500">
            Dark Mode: {isDarkMode ? "ON 🌙" : "OFF ☀️"}
          </p>
        </div>

        {/* STATS CARD */}
        <div className={`rounded-2xl shadow-lg p-6 mb-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className={`w-8 h-8 ${isDarkMode ? "text-purple-400" : "text-indigo-600"}`} />
              <div>
                <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Total Students</p>
                <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>{students.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-500"}`}>Present Today</p>
              <p className="text-3xl font-bold text-green-500">{presentCount}</p>
            </div>
          </div>
        </div>

        {/* ADD STUDENT */}
        <div className={`rounded-2xl shadow-lg p-6 mb-6 ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStudent()}
              placeholder="Enter student name..."
              className={`flex-1 px-4 py-3 rounded-xl border ${isDarkMode ? "bg-gray-700 border-gray-600 text-white" : "bg-gray-50 border-gray-300"} focus:outline-none focus:ring-2 focus:ring-indigo-500`}
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

        {/* STUDENTS LIST */}
        <div className="space-y-4">
          {students.length === 0 ? (
            <div className={`text-center py-12 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
              No students yet. Add one above!
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className={`rounded-2xl shadow-lg p-6 flex items-center justify-between transform transition hover:scale-[1.02] ${isDarkMode ? "bg-gray-800" : "bg-white"}`}
              >
                <div className="flex-1">
                  <h3 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                    {student.name}
                  </h3>
                  <p className={`text-sm mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                    className={`p-3 rounded-xl transition ${isDarkMode ? "text-red-400 hover:bg-gray-700" : "text-red-500 hover:bg-red-50"}`}
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
