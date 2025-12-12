import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Users, Calendar } from "lucide-react";

// Confetti particle interface
interface ConfettiParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  shape: "circle" | "square" | "triangle";
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  decay: number;
}

export default function ClassMonitoringApp() {
  const [students, setStudents] = useState([
    { id: 1, name: "Peter", present: true, date: new Date().toLocaleDateString() },
    { id: 2, name: "John", present: false, date: new Date().toLocaleDateString() },
  ]);

  const [newName, setNewName] = useState("");
  const [confetti, setConfetti] = useState<ConfettiParticle[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Colors for confetti
  const confettiColors = [
    "#FF6B6B", "#4ECDC4", "#FFD166", "#06D6A0", "#118AB2", 
    "#EF476F", "#9D4EDD", "#FF9E00", "#7209B7", "#3A86FF"
  ];

  // Create confetti burst
  const createConfettiBurst = (x: number, y: number, count = 50) => {
    const newParticles: ConfettiParticle[] = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 3;
      
      newParticles.push({
        x,
        y,
        size: 5 + Math.random() * 10,
        speedX: Math.cos(angle) * velocity,
        speedY: Math.sin(angle) * velocity - 2, // Slightly upward
        color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        shape: ["circle", "square", "triangle"][Math.floor(Math.random() * 3)] as any,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: 0.8 + Math.random() * 0.2,
        decay: 0.95 + Math.random() * 0.04,
      });
    }
    
    setConfetti(prev => [...prev, ...newParticles]);
  };

  // Draw confetti
  const drawConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw each particle
    setConfetti(prev => {
      const updatedParticles = prev.map(particle => {
        // Update position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Add gravity
        particle.speedY += 0.1;
        
        // Apply decay
        particle.speedX *= particle.decay;
        particle.speedY *= particle.decay;
        
        // Update rotation
        particle.rotation += particle.rotationSpeed;
        
        // Reduce opacity
        particle.opacity *= 0.99;
        
        return particle;
      }).filter(particle => particle.opacity > 0.05 && particle.y < canvas.height);
      
      // Draw all particles
      updatedParticles.forEach(particle => {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation * Math.PI / 180);
        ctx.globalAlpha = particle.opacity;
        ctx.fillStyle = particle.color;
        
        switch (particle.shape) {
          case "circle":
            ctx.beginPath();
            ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
            ctx.fill();
            break;
            
          case "square":
            ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
            break;
            
          case "triangle":
            ctx.beginPath();
            ctx.moveTo(0, -particle.size / 2);
            ctx.lineTo(particle.size / 2, particle.size / 2);
            ctx.lineTo(-particle.size / 2, particle.size / 2);
            ctx.closePath();
            ctx.fill();
            break;
        }
        
        ctx.restore();
      });
      
      return updatedParticles;
    });
    
    // Continue animation if there are particles
    if (confetti.length > 0) {
      animationRef.current = requestAnimationFrame(drawConfetti);
    }
  };

  // Initialize canvas size
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    
    return () => {
      window.removeEventListener("resize", updateCanvasSize);
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  // Handle confetti animation
  useEffect(() => {
    if (confetti.length > 0) {
      animationRef.current = requestAnimationFrame(drawConfetti);
    }
    
    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, [confetti.length]);

  const toggleAttendance = (id: number) => {
    setStudents((prev) => {
      const updated = prev.map((s) =>
        s.id === id
          ? { ...s, present: !s.present, date: new Date().toLocaleDateString() }
          : s
      );
      
      // Trigger confetti when student becomes present
      const student = updated.find(s => s.id === id);
      if (student?.present) {
        const randomX = window.innerWidth * Math.random();
        const randomY = 100;
        createConfettiBurst(randomX, randomY);
      }
      
      return updated;
    });
  };

  const addStudent = () => {
    if (!newName.trim()) return;
    
    setStudents((prev) => {
      const newStudent = {
        id: Date.now(),
        name: newName.trim(),
        present: false,
        date: new Date().toLocaleDateString(),
      };
      
      // Trigger confetti when adding student
      setTimeout(() => {
        const randomX = window.innerWidth * Math.random();
        const randomY = 200;
        createConfettiBurst(randomX, randomY, 30);
      }, 100);
      
      return [...prev, newStudent];
    });
    
    setNewName("");
  };

  const deleteStudent = (id: number) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
  };

  const presentCount = students.filter((s) => s.present).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 overflow-hidden">
      {/* Canvas for confetti */}
      <canvas
        ref={canvasRef}
        className="fixed top-0 left-0 w-full h-full pointer-events-none z-10"
      />
      
      <div className="max-w-2xl mx-auto relative z-20">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Class Monitoring
          </h1>
          <p className="text-lg text-gray-600 flex items-center justify-center gap-2">
            <Calendar className="w-5 h-5" />
            {today}
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-indigo-600" />
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-800">{students.length}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Present Today</p>
              <p className="text-3xl font-bold text-green-600">{presentCount}</p>
            </div>
          </div>
        </div>

        {/* Add Student */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addStudent()}
              placeholder="Enter student name..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={addStudent}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl flex items-center gap-2 transition shadow-lg hover:shadow-xl relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            </button>
          </div>
        </div>

        {/* Students List */}
        <div className="space-y-4">
          {students.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No students yet. Add one above!
            </div>
          ) : (
            students.map((student) => (
              <div
                key={student.id}
                className="bg-white rounded-2xl shadow-lg p-6 flex items-center justify-between transform transition hover:scale-[1.02] relative overflow-hidden group"
              >
                {/* Subtle background effect */}
                <div className={`absolute inset-0 opacity-5 ${student.present ? 'bg-green-500' : 'bg-red-500'} transform transition-transform duration-300 group-hover:scale-110`}></div>
                
                <div className="flex-1 relative z-10">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {student.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Last updated: {student.date}
                  </p>
                </div>

                <div className="flex items-center gap-3 relative z-10">
                  <button
                    onClick={() => toggleAttendance(student.id)}
                    className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 active:scale-95 relative overflow-hidden ${
                      student.present
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                        : "bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700"
                    }`}
                  >
                    <span className="relative z-10">{student.present ? "Present" : "Absent"}</span>
                    <span className="absolute inset-0 bg-white opacity-0 hover:opacity-20 transition-opacity"></span>
                  </button>

                  <button
                    onClick={() => deleteStudent(student.id)}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition transform hover:scale-110 active:scale-95"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Celebration message */}
        {presentCount === students.length && students.length > 0 && (
          <div className="mt-6 text-center animate-bounce">
            <div className="inline-block bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-bold text-lg shadow-lg">
              🎉 Full Attendance! Amazing! 🎉
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
