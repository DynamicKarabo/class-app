import React, { useState, useEffect } from "react";
import { Plus, UserCheck, UserX } from "lucide-react";

export default function ClassMonitoringApp() {
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem("classStudents");
    return saved ? JSON.parse(saved) : [{ id: 1, name: "John Doe", present: false, date: new Date().toLocaleDateString("en-ZA") }];
  });

  useEffect(() => localStorage.setItem("classStudents", JSON.stringify(students)), [students]);

  const toggleAttendance = (id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, present: !s.present, date: new Date().toLocaleDateString("en-ZA") } : s));
  };

  const addStudent = () => {
    const name = prompt("Enter student's full name:");
    if (name?.trim()) {
      setStudents(prev => [...prev, { id: Date.now(), name: name.trim(), present: false, date: new Date().toLocaleDateString("en-ZA") }]);
    }
  };

  const presentCount = students.filter(s => s.present).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">Class Attendance</h1>
        <p className="text-center text-xl text-gray-600 mb-6">
          {new Date().toLocaleDateString("en-ZA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div className="text-center text-6xl font-black text-indigo-600 mb-10">
          {presentCount} <span className="text-4xl text-gray-500">/</span> {students.length}
        </div>

        <button onClick={addStudent} className="w-full mb-8 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-xl transition text-xl">
          <Plus size={32} /> Add Student
        </button>

        <div className="space-y-4">
          {students.map(s => (
            <div key={s.id} className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-800">{s.name}</p>
                <p className="text-sm text-gray-500">Updated: {s.date}</p>
              </div>
              <button onClick={() => toggleAttendance(s.id)} className={`flex items-center gap-4 px-10 py-5 rounded-2xl text-white font-bold text-xl transition shadow-md ${s.present ? "bg-green-500 hover:bg-green-600" : "bg-red-500 hover:bg-red-600"}`}>
                {s.present ? <UserCheck size={36} /> : <UserX size={36} />}
                {s.present ? "Present" : "Absent"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
