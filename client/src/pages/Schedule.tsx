import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";

interface Client {
  id: string;
  name: string;
}

interface Exercise {
  id: string;
  name: string;
}

interface WorkoutSet {
  exerciseId: string;
  weight: string;
  reps: string;
  sets: string;
}

interface Workout {
  id: string;
  date: string;
  time: string;
  clientId: string;
  clientName: string;
  workoutSets: WorkoutSet[];
}

const TIMES = [
  "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
  "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
  "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
];

export default function Schedule() {
  const [, navigate] = useLocation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [workoutSets, setWorkoutSets] = useState<WorkoutSet[]>(
    Array(7).fill(null).map(() => ({ exerciseId: "", weight: "", reps: "", sets: "" }))
  );

  // Load data from localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem("ngfit_clients");
    const savedExercises = localStorage.getItem("ngfit_exercises");
    const savedWorkouts = localStorage.getItem("ngfit_workouts");

    if (savedClients) {
      const parsed = JSON.parse(savedClients);
      setClients(parsed.map((c: any) => ({ id: c.id, name: c.name })));
    }
    if (savedExercises) {
      const parsed = JSON.parse(savedExercises);
      setExercises(parsed.map((e: any) => ({ id: e.id, name: e.name })));
    }
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    }
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  const handleDateSelect = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(formatDate(date));
    setSelectedTime(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleAddWorkout = () => {
    if (!selectedDate || !selectedTime || !selectedClient) {
      alert("Выберите дату, время и клиента");
      return;
    }

    const validSets = workoutSets.filter(s => s.exerciseId);
    if (validSets.length === 0) {
      alert("Добавьте хотя бы одно упражнение");
      return;
    }

    const clientName = clients.find(c => c.id === selectedClient)?.name || "";
    const newWorkout: Workout = {
      id: Date.now().toString(),
      date: selectedDate,
      time: selectedTime,
      clientId: selectedClient,
      clientName,
      workoutSets: validSets,
    };

    const updated = [...workouts, newWorkout];
    setWorkouts(updated);
    localStorage.setItem("ngfit_workouts", JSON.stringify(updated));

    // Reset form
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedClient("");
    setWorkoutSets(Array(7).fill(null).map(() => ({ exerciseId: "", weight: "", reps: "", sets: "" })));
  };

  const handleDeleteWorkout = (id: string) => {
    if (confirm("Удалить тренировку?")) {
      const updated = workouts.filter(w => w.id !== id);
      setWorkouts(updated);
      localStorage.setItem("ngfit_workouts", JSON.stringify(updated));
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateStr = formatDate(date);
      const isSelected = selectedDate === dateStr;
      const hasWorkout = workouts.some(w => w.date === dateStr);

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          className={`p-2 rounded-lg text-sm font-semibold transition-all ${
            isSelected
              ? "bg-blue-500 text-white"
              : hasWorkout
              ? "bg-green-600 text-white"
              : "bg-slate-700 text-white hover:bg-slate-600"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  // Show calendar view
  if (!selectedDate) {
    return (
      <div className="min-h-screen w-full p-4 relative">
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-3xl font-bold text-white">Расписание</h1>
          </div>

          {/* Calendar */}
          <Card className="bg-slate-800/95 backdrop-blur p-6 rounded-2xl border border-slate-700">
            {/* Month/Year Header */}
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="text-white hover:bg-slate-700"
              >
                <ChevronLeft size={20} />
              </Button>
              <h2 className="text-xl font-bold text-white">
                {currentDate.toLocaleString("ru-RU", { month: "long", year: "numeric" })}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="text-white hover:bg-slate-700"
              >
                <ChevronRight size={20} />
              </Button>
            </div>

            {/* Days of week */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(day => (
                <div key={day} className="text-center font-semibold text-cyan-400 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show time selection
  if (!selectedTime) {
    return (
      <div className="min-h-screen w-full p-4 relative">
        <div className="absolute inset-0 bg-black/50"></div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedDate(null)}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-3xl font-bold text-white">
              {new Date(selectedDate).toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" })}
            </h1>
          </div>

          {/* Time selection */}
          <Card className="bg-white/95 backdrop-blur p-6 rounded-2xl">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Выберите время</h2>
            <div className="grid grid-cols-3 gap-3">
              {TIMES.map(time => (
                <Button
                  key={time}
                  onClick={() => handleTimeSelect(time)}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 rounded-lg"
                >
                  {time}
                </Button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Show workout form
  return (
    <div className="min-h-screen w-full p-4 relative">
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSelectedTime(null)}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-3xl font-bold text-white">Новая тренировка</h1>
        </div>

        {/* Workout Form */}
        <Card className="bg-white/95 backdrop-blur p-6 rounded-2xl space-y-4">
          {/* Date and Time (auto-filled) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Дата</label>
              <Input
                type="text"
                value={new Date(selectedDate).toLocaleDateString("ru-RU")}
                disabled
                className="bg-gray-100 text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Время</label>
              <Input
                type="text"
                value={selectedTime}
                disabled
                className="bg-gray-100 text-gray-900"
              />
            </div>
          </div>

          {/* Client Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Клиент</label>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            >
              <option value="">Выберите клиента</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Exercises */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Упражнения</h3>
            {workoutSets.map((set, index) => (
              <div key={index} className="space-y-2">
                <select
                  value={set.exerciseId}
                  onChange={(e) => {
                    const newSets = [...workoutSets];
                    newSets[index].exerciseId = e.target.value;
                    setWorkoutSets(newSets);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
                >
                  <option value="">Упражнение {index + 1}</option>
                  {exercises.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name}
                    </option>
                  ))}
                </select>

                {set.exerciseId && (
                  <div className="grid grid-cols-3 gap-2 pl-4 border-l-2 border-gray-300">
                    <Input
                      placeholder="Вес (кг)"
                      value={set.weight}
                      onChange={(e) => {
                        const newSets = [...workoutSets];
                        newSets[index].weight = e.target.value;
                        setWorkoutSets(newSets);
                      }}
                      className="bg-gray-50"
                    />
                    <Input
                      placeholder="Повторения"
                      value={set.reps}
                      onChange={(e) => {
                        const newSets = [...workoutSets];
                        newSets[index].reps = e.target.value;
                        setWorkoutSets(newSets);
                      }}
                      className="bg-gray-50"
                    />
                    <Input
                      placeholder="Подходы"
                      value={set.sets}
                      onChange={(e) => {
                        const newSets = [...workoutSets];
                        newSets[index].sets = e.target.value;
                        setWorkoutSets(newSets);
                      }}
                      className="bg-gray-50"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Save Button */}
          <Button
            onClick={handleAddWorkout}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3"
          >
            Сохранить тренировку
          </Button>
        </Card>

        {/* Workouts List */}
        {workouts.length > 0 && (
          <div className="mt-6 space-y-3">
            <h2 className="text-2xl font-bold text-white">Запланированные тренировки</h2>
            {workouts
              .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
              .map(workout => (
                <Card key={workout.id} className="bg-white/95 backdrop-blur p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-blue-600">
                          {new Date(workout.date).toLocaleDateString("ru-RU")} {workout.time}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-900">{workout.clientName}</p>
                      <div className="text-sm text-gray-600 mt-2">
                        {workout.workoutSets.map((set, idx) => (
                          <div key={idx}>
                            {exercises.find(e => e.id === set.exerciseId)?.name} - {set.sets}x{set.reps} @ {set.weight}кг
                          </div>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteWorkout(workout.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      ✕
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
