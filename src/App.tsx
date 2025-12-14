import { useState, useEffect } from "react";
// Added ListPlus and BookOpen for UI
import { Plus, Trash2, Users, Calendar, Download, Shuffle, Upload, RotateCcw, XCircle, ListPlus, BookOpen } from "lucide-react"; 

// Define the type for a student object
interface Student {
    id: number;
    name: string;
    present: boolean;
    date: string;
}

// --- NEW INTERFACE FOR ROSTER ---
interface Roster {
    id: string; // Unique ID for keying/selection
    name: string; // The class name (e.g., "Math 101")
    students: Student[];
}
// --- END NEW INTERFACE ---

// Define the type for filter options
type FilterStatus = 'ALL' | 'PRESENT' | 'ABSENT';

// Helper to get initial state from Local Storage (for basic persistence)
const getInitialRosters = (): Roster[] => {
    try {
        const storedRosters = localStorage.getItem('classRosters');
        if (storedRosters) return JSON.parse(storedRosters);
    } catch (error) {
        console.error("Error loading rosters from local storage:", error);
    }
    // Default initial roster
    return [{
        id: 'default-01',
        name: 'Default Class Roster',
        students: [],
    }];
};

const getInitialRosterName = (rosters: Roster[]): string => {
    try {
        const storedName = localStorage.getItem('currentRosterName');
        // Ensure the stored name corresponds to an existing roster
        if (storedName && rosters.some(r => r.name === storedName)) {
            return storedName;
        }
    } catch (error) {
        console.error("Error loading current roster name:", error);
    }
    return rosters[0].name;
};


export default function ClassMonitoringApp() {
  // --- UPDATED STATE MANAGEMENT ---
  const [allRosters, setAllRosters] = useState<Roster[]>(getInitialRosters);
  const [currentRosterName, setCurrentRosterName] = useState<string>(
    () => getInitialRosterName(getInitialRosters())
  );
  const [showCelebration, setShowCelebration] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const [showRosterSelector, setShowRosterSelector] = useState(false); // For dropdown UI

  // Effect for Local Storage persistence
  useEffect(() => {
    localStorage.setItem('classRosters', JSON.stringify(allRosters));
    localStorage.setItem('currentRosterName', currentRosterName);
  }, [allRosters, currentRosterName]);
  // --- END UPDATED STATE MANAGEMENT ---

  // --- DERIVED STATE ---
  const currentRoster = allRosters.find(r => r.name === currentRosterName) || allRosters[0];
  const students = currentRoster ? currentRoster.students : [];
  
  const totalStudents = students.length;
  const presentCount = students.filter((s) => s.present).length;
  const presentPercentage = totalStudents > 0 ? (presentCount / totalStudents) * 100 : 0;
  
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Helper to update the students array within the current roster
  const updateCurrentRoster = (newStudents: Student[], resetCelebration = true) => {
    setAllRosters(prevRosters => 
        prevRosters.map(r => 
            r.name === currentRosterName 
            ? { ...r, students: newStudents } 
            : r
        )
    );
    if (resetCelebration) setShowCelebration(false);
  };
  // --- END DERIVED STATE ---
  
  // --- NEW ROSTER MANAGEMENT FUNCTIONS ---
  const switchRoster = (name: string) => {
      setCurrentRosterName(name);
      setSelectedStudentId(null);
      setShowCelebration(false);
      setShowRosterSelector(false);
  };

  const addRoster = () => {
      const name = prompt("Enter the name for the new class roster:");
      if (name && name.trim() && !allRosters.some(r => r.name === name.trim())) {
          const newRoster: Roster = {
              id: Date.now().toString(),
              name: name.trim(),
              students: [],
          };
          setAllRosters(prev => [...prev, newRoster]);
          switchRoster(newRoster.name);
      } else if (name) {
          alert("Invalid name or a roster with this name already exists.");
      }
  };

  const deleteRoster = (name: string) => {
      if (allRosters.length === 1) {
          alert("Cannot delete the last remaining roster.");
          return;
      }

      const isConfirmed = window.confirm(`Are you sure you want to permanently delete the roster "${name}"? This action is irreversible.`);
      
      if (isConfirmed) {
          setAllRosters(prev => {
              const remainingRosters = prev.filter(r => r.name !== name);
              
              // If we delete the current roster, switch to the first remaining one
              if (currentRosterName === name) {
                  setCurrentRosterName(remainingRosters[0].name);
              }
              setSelectedStudentId(null);
              setShowCelebration(false);
              return remainingRosters;
          });
          alert(`Roster "${name}" has been deleted.`);
      }
  };
  // --- END NEW ROSTER MANAGEMENT FUNCTIONS ---

  // --- UPDATED CORE FUNCTIONS (Now using updateCurrentRoster) ---

  const toggleAttendance = (id: number) => {
    let newPresentCount = presentCount;
    let newStudents: Student[] = [];

    const updatedStudents = students.map((s) => {
        if (s.id === id) {
            // Check if status is changing
            if (!s.present) {
                newPresentCount++;
            } else {
                newPresentCount--;
            }
            return { ...s, present: !s.present, date: new Date().toLocaleDateString() }
        }
        return s;
    });

    newStudents = updatedStudents;
    updateCurrentRoster(newStudents, false); // Do not reset celebration yet

    // Check for full attendance immediately after state change simulation
    if (newPresentCount > 0 && newPresentCount === totalStudents) {
        setShowCelebration(true);
    } else {
        setShowCelebration(false);
    }
  };

  const addStudent = () => {
    if (!newName.trim()) return;
    
    // Dismiss celebration if we add a new student but they are not present
    if (presentCount === totalStudents) setShowCelebration(false);

    const newStudent: Student = {
        id: Date.now(),
        name: newName.trim(),
        present: false,
        date: new Date().toLocaleDateString(),
    };

    updateCurrentRoster([...students, newStudent]);
    setNewName("");
  };

  const deleteStudent = (id: number) => {
    // Check if deleting the student breaks full attendance
    const studentToDelete = students.find(s => s.id === id);
    if (studentToDelete && studentToDelete.present && presentCount === totalStudents) {
        setShowCelebration(false);
    }
    
    const newStudents = students.filter((s) => s.id !== id);
    updateCurrentRoster(newStudents, false);

    if (selectedStudentId === id) setSelectedStudentId(null);
  };
  
  const deleteAllStudents = () => {
    const isConfirmed = window.confirm(
      `WARNING: This action is irreversible. Are you absolutely sure you want to permanently delete ALL students from the roster "${currentRosterName}"?`
    );

    if (isConfirmed) {
      updateCurrentRoster([]); 
      setSelectedStudentId(null);
      alert(`All students in "${currentRosterName}" have been permanently deleted.`);
    }
  };

  const importStudentsFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      const names = content
        .split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0);

      const newStudents: Student[] = names.map(name => ({
        id: Date.now() + Math.random(), 
        name: name,
        present: false,
        date: new Date().toLocaleDateString(),
      }));

      // Importing new students breaks full attendance (since they are absent)
      if (presentCount === totalStudents && newStudents.length > 0) setShowCelebration(false);

      updateCurrentRoster([...students, ...newStudents], false);
      alert(`Successfully imported ${newStudents.length} students into "${currentRosterName}"!`);
    };

    reader.onerror = () => {
      alert("Error reading file.");
    };

    reader.readAsText(file);
    event.target.value = '';
  };
  
  const resetAttendance = () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to reset the attendance for ALL students in "${currentRosterName}"? This will mark everyone as ABSENT for a new session.`
    );

    if (isConfirmed) {
      const newStudents = students.map((s) => ({
          ...s,
          present: false,
          date: new Date().toLocaleDateString(),
      }));

      updateCurrentRoster(newStudents);
      setSelectedStudentId(null);
      alert(`Attendance list for "${currentRosterName}" has been reset for the new session.`);
    }
  };
  
  // Export and Random Pick functions remain largely the same, using the 'students' derived state

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
    link.setAttribute("download", `${currentRosterName.replace(/\s/g, '_')}-attendance-${new Date().toISOString().split("T")[0]}.csv`);
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

    // --- DYNAMIC CONFETTI LOGIC (RETAINED) ---
    const colors = ["#2563EB", "#FACC15", "#48BB78", "#F56565", "#9F7AEA"]; 
    
    // We need a stable reference for confetti launch position
    const button = document.querySelector('.confetti-launch-button'); 
    
    const buttonRect = button 
        ? button.getBoundingClientRect() 
        : { 
            top: window.innerHeight / 2, 
            left: window.innerWidth / 2, 
            width: 0, 
            height: 0
          };

    const confettiContainer = document.createElement("div");
    confettiContainer.style.position = "fixed";
    confettiContainer.style.top = "0";
    confettiContainer.style.left = "0";
    confettiContainer.style.width = "100%";
    confettiContainer.style.height = "100%";
    confettiContainer.style.pointerEvents = "none";
    confettiContainer.style.zIndex = "9999";
    document.body.appendChild(confettiContainer);

    const style = document.createElement("style");
    let keyframeContent = '';

    for (let i = 0; i < 100; i++) {
        const duration = (2 + Math.random() * 1.5).toFixed(2); 
        const delay = (Math.random() * 0.5).toFixed(2); 
        const initialX = buttonRect.left + (buttonRect.width / 2);
        const initialY = buttonRect.top + (buttonRect.height / 2);
        
        const endX = initialX + (Math.random() - 0.5) * 800; 
        const endY = window.innerHeight * 1.5; 
        const midY = initialY - (Math.random() * 200 + 100); 
        
        const rotateStart = Math.random() * 360;
        const rotateEnd = rotateStart + (Math.random() > 0.5 ? 1000 : -1000); 

        keyframeContent += `
          @keyframes confetti-burst-${i} {
            0% {
              transform: translate(${initialX}px, ${initialY}px) rotate(${rotateStart}deg);
              opacity: 1;
            }
            30% {
              transform: translate(${endX}px, ${midY}px) rotate(${rotateStart + 360}deg);
            }
            100% {
              transform: translate(${endX}px, ${endY}px) rotate(${rotateEnd}deg);
              opacity: 0;
            }
          }
        `;

        const confetti = document.createElement("div");
        confetti.style.position = "absolute";
        confetti.style.width = (5 + Math.random() * 5) + "px";
        confetti.style.height = (5 + Math.random() * 10) + "px"; 
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = (Math.random() > 0.5 ? '50%' : '2px'); 
        confetti.style.animation = `confetti-burst-${i} ${duration}s cubic-bezier(0.2, 0.2, 0.8, 0.8) ${delay}s forwards`;
        confettiContainer.appendChild(confetti);
    }

    style.textContent = keyframeContent;
    document.head.appendChild(style);

    setTimeout(() => {
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 4500); 
    // --- END DYNAMIC CONFETTI LOGIC ---
  };

  // --- Filtered Students Calculation (RETAINED) ---
  const filteredStudents = students.filter((student) => {
    if (filterStatus === 'PRESENT') {
        return student.present;
    }
    if (filterStatus === 'ABSENT') {
        return !student.present;
    }
    return true; // 'ALL' status
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 transition-colors">
      <div className="max-w-2xl mx-auto">
        
        {/* Full Attendance Celebration Banner */}
        {showCelebration && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-lg shadow-lg flex items-center justify-between transition-all duration-300 transform animate-pulse">
                <div className="flex items-center">
                    <span className="text-3xl mr-3">🎉</span>
                    <p className="font-bold text-lg">100% Attendance Achieved!</p>
                </div>
                <button 
                    onClick={() => setShowCelebration(false)}
                    className="text-green-500 hover:text-green-700 p-1"
                >
                    <XCircle className="w-5 h-5" />
                </button>
            </div>
        )}

        {/* Header (Cleaned up alignment) */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
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
        
        {/* --- ROSTER SELECTOR BAR (NEW) --- */}
        <div className="relative mb-6">
            <button
                onClick={() => setShowRosterSelector(prev => !prev)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-between transition-colors shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    <span className="truncate">{currentRosterName}</span>
                </div>
                <Users className="w-5 h-5" />
            </button>
            
            {showRosterSelector && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl z-20 max-h-60 overflow-y-auto">
                    {allRosters.map((roster) => (
                        <div
                            key={roster.id}
                            className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                                currentRosterName === roster.name 
                                    ? 'bg-blue-100 dark:bg-blue-900/50 font-bold text-blue-700 dark:text-blue-300' 
                                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            <span onClick={() => switchRoster(roster.name)} className="flex-1">
                                {roster.name} ({roster.students.length})
                            </span>
                            {allRosters.length > 1 && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent switchRoster trigger
                                        deleteRoster(roster.name);
                                    }}
                                    className="p-1 text-red-500 hover:text-red-700 dark:hover:text-red-400 rounded transition-colors"
                                    title={`Delete ${roster.name}`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addRoster}
                        className="w-full p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold rounded-b-xl flex items-center justify-center gap-2"
                    >
                        <ListPlus className="w-5 h-5" />
                        Create New Roster
                    </button>
                </div>
            )}
        </div>
        {/* --- END ROSTER SELECTOR BAR --- */}

        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/50">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Students</p>
                <p className="text-3xl font-bold text-gray-800 dark:text-gray-100">{totalStudents}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Present Today</p>
              <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">{presentCount}</p>
            </div>
          </div>
          
          {/* Progress Bar Visualization */}
          {totalStudents > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                        className="absolute top-0 left-0 h-full bg-green-500 rounded-full transition-all duration-500" 
                        style={{ width: `${presentPercentage}%` }}
                        title={`${Math.round(presentPercentage)}% Present`}
                    ></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right font-medium">
                    {Math.round(presentPercentage)}% Attendance
                </p>
            </div>
          )}
        </div>

        {/* Utility Actions (Import & Reset) */}
        <div className="flex justify-between gap-4 mb-4">
          {/* Import Students Button */}
          <div className="relative flex-1">
            <input
              type="file"
              id="student-import"
              accept=".txt,.csv"
              onChange={importStudentsFromFile}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
            />
            <label 
              htmlFor="student-import"
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
            >
              <Upload className="w-5 h-5" />
              Import List
            </label>
          </div>

          {/* Reset Attendance Button */}
          <button
            onClick={resetAttendance}
            className="flex-1 bg-red-500/80 hover:bg-red-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg"
          >
            <RotateCcw className="w-5 h-5" />
            Reset All
          </button>
        </div>

        {/* Main Actions (Export & Random) */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button
            onClick={exportToCSV}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={pickRandomStudent}
            className="confetti-launch-button bg-teal-500 hover:bg-teal-600 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-500/30 hover:shadow-xl"
          >
            <Shuffle className="w-5 h-5" />
            Pick Random
          </button>
        </div>

        {/* Add Student */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStudent()}
              placeholder="Or manually add student name..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={addStudent}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        {/* Students List Container */}
        <div className="space-y-4">
          
          {/* Roster Header (with Delete All Button) */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Roster: {currentRosterName}
            </h2>
            
            <button
                onClick={deleteAllStudents}
                className="text-red-600 dark:text-red-400 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors flex items-center gap-1 font-medium"
                title={`Permanently Delete All Students in ${currentRosterName}`}
            >
                <Trash2 className="w-5 h-5" />
                Clear List
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 mb-4 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-gray-100 dark:border-gray-700">
            {['ALL', 'PRESENT', 'ABSENT'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status as FilterStatus)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  filterStatus === status
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {filteredStudents.length === 0 && students.length > 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
              <Users className="w-8 h-8 mx-auto mb-3" />
              <p className="font-medium">No students currently set to **{filterStatus}** in this roster.</p>
            </div>
          ) : filteredStudents.length === 0 && students.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
                <Users className="w-8 h-8 mx-auto mb-3" />
                <p className="font-medium">This roster is empty. Add students manually above or import a list.</p>
            </div>
          ) : (
            filteredStudents.map((student) => (
              <div
                key={student.id}
                className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 flex items-center justify-between transition-all duration-300 border border-gray-100 dark:border-gray-700 ${
                  selectedStudentId === student.id
                    ? "ring-4 ring-blue-400 scale-[1.03] shadow-2xl"
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
                    className={`
                      px-4 py-2 rounded-lg font-medium text-white shadow-md transition-all 
                      transform hover:scale-105 active:scale-95 duration-100 ease-out 
                      min-w-[100px] 
                      ${student.present
                        ? "bg-green-500 hover:bg-green-600"
                        : "bg-red-500 hover:bg-red-600"
                      }
                    `}
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

        {/* Footer with credits */}
        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            Built and Designed with ❤️ by Karabo Oliphant. © All Rights Reserved 2025
          </p>
        </div>
      </div>
    </div>
  );
}
