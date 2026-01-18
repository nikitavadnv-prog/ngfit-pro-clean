import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, LogOut, Edit2, Save, Eye } from "lucide-react";

interface TrainerProfile {
  name: string;
  phone: string;
  email: string;
  specialization: string;
  experience: string;
  bio: string;
}

interface Workout {
  id: string;
  date: string;
  time: string;
  clientId: string;
  clientName: string;
  workoutSets: Array<{
    exerciseId: string;
    weight: string;
    reps: string;
    sets: string;
  }>;
}

export default function Profile() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"workouts" | "profile">("workouts");
  const [isEditing, setIsEditing] = useState(false);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [exercises, setExercises] = useState<any[]>([]);
  const [profile, setProfile] = useState<TrainerProfile>({
    name: "",
    phone: "",
    email: "",
    specialization: "",
    experience: "",
    bio: "",
  });
  const [editProfile, setEditProfile] = useState<TrainerProfile>({ ...profile });
  const [user, setUser] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]); // Added clients state

  // Load data from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("ngfit_user");
    const savedProfile = localStorage.getItem("ngfit_trainer_profile");
    const savedWorkouts = localStorage.getItem("ngfit_workouts");
    const savedExercises = localStorage.getItem("ngfit_exercises");
    const savedClients = localStorage.getItem("ngfit_clients"); // Load clients

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedProfile) {
      const prof = JSON.parse(savedProfile);
      setProfile(prof);
      setEditProfile(prof);
    }
    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    }
    if (savedExercises) {
      setExercises(JSON.parse(savedExercises));
    }
    if (savedClients) {
      setClients(JSON.parse(savedClients)); // Set clients
    }
  }, []);

  const handleLogout = () => {
    if (confirm("Вы уверены, что хотите выйти?")) {
      localStorage.removeItem("ngfit_user");
      navigate("/");
      window.location.reload();
    }
  };

  const handleSaveProfile = () => {
    setProfile(editProfile);
    localStorage.setItem("ngfit_trainer_profile", JSON.stringify(editProfile));
    setIsEditing(false);
  };

  const handleDeleteWorkout = (id: string) => {
    if (confirm("Удалить тренировку?")) {
      const updated = workouts.filter(w => w.id !== id);
      setWorkouts(updated);
      localStorage.setItem("ngfit_workouts", JSON.stringify(updated));
    }
  };

  const getExerciseName = (id: string) => {
    return exercises.find(e => e.id === id)?.name || "Неизвестное упражнение";
  };

  return (
    <div className="min-h-screen w-full p-4 relative">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft size={24} />
            </Button>
            <h1 className="text-3xl font-bold text-white">Профиль</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-red-400 hover:bg-red-500/20"
            title="Выход"
          >
            <LogOut size={24} />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab("workouts")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${activeTab === "workouts"
              ? "bg-blue-500 text-white"
              : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
          >
            📋 Тренировки
          </Button>
          <Button
            onClick={() => setActiveTab("profile")}
            className={`flex-1 py-3 rounded-lg font-semibold transition-all ${activeTab === "profile"
              ? "bg-blue-500 text-white"
              : "bg-slate-700 text-white hover:bg-slate-600"
              }`}
          >
            👤 Пользователь
          </Button>
        </div>

        {/* Workouts Tab */}
        {activeTab === "workouts" && (
          <div className="space-y-3">
            {workouts.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur p-8 text-center rounded-2xl">
                <p className="text-gray-600">Нет записанных тренировок</p>
              </Card>
            ) : (
              workouts
                .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
                .map(workout => (
                  <Card key={workout.id} className="bg-white/95 backdrop-blur p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-bold text-blue-600">
                            {new Date(workout.date).toLocaleDateString("ru-RU")} {workout.time}
                          </span>
                        </div>
                        <div
                          className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors flex items-center gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            // 1. Try direct ID match
                            let cId = workout.clientId;

                            // 2. If no ID or ID not found, try finding by name (exact)
                            if (!cId || !clients.find(c => c.id === cId)) {
                              const exactMatch = clients.find(c => c.name === workout.clientName);
                              if (exactMatch) cId = exactMatch.id;
                            }

                            // 3. If still not found, try finding by surname (fuzzy match)
                            if (!cId) {
                              const parts = workout.clientName.split(" ");
                              if (parts.length > 1) {
                                // Assuming Surname is usually the second part or the longest part
                                const surname = parts.sort((a, b) => b.length - a.length)[0];
                                const fuzzyMatch = clients.find(c => c.name.includes(surname));
                                if (fuzzyMatch) cId = fuzzyMatch.id;
                              }
                            }

                            if (cId) {
                              navigate(`/clients/${cId}`);
                            } else {
                              alert(`Клиент "${workout.clientName}" не найден в базе`);
                            }
                          }}
                        >
                          {/* Display REAL name from DB if available, otherwise historical name */}
                          {clients.find(c => c.id === workout.clientId)?.name || workout.clientName}
                          <Eye size={16} className="text-blue-500" />
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-blue-600 hover:bg-blue-50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            // Same smart lookup logic
                            let cId = workout.clientId;
                            if (!cId || !clients.find(c => c.id === cId)) {
                              const exactMatch = clients.find(c => c.name === workout.clientName);
                              if (exactMatch) cId = exactMatch.id;
                            }
                            if (!cId) {
                              const parts = workout.clientName.split(" ");
                              if (parts.length > 1) {
                                const surname = parts.sort((a, b) => b.length - a.length)[0];
                                const fuzzyMatch = clients.find(c => c.name.includes(surname));
                                if (fuzzyMatch) cId = fuzzyMatch.id;
                              }
                            }

                            if (cId) {
                              navigate(`/clients/${cId}`);
                            } else {
                              alert(`Клиент "${workout.clientName}" не найден в базе`);
                            }
                          }}
                        >
                          <Eye size={18} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteWorkout(workout.id)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>

                    {/* Workout details */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      {workout.workoutSets.map((set, idx) => (
                        <div key={idx} className="text-sm text-gray-700">
                          <span className="font-semibold">{getExerciseName(set.exerciseId)}</span>
                          {" — "}
                          <span className="text-gray-600">
                            {set.sets}x{set.reps} @ {set.weight}кг
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <Card className="bg-white/95 backdrop-blur p-6 rounded-2xl space-y-4">
            {/* User Info */}
            {user && (
              <div className="bg-blue-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600">Telegram пользователь:</p>
                <p className="text-lg font-semibold text-gray-900">
                  {user.firstName} {user.lastName}
                </p>
                {user.username && (
                  <p className="text-sm text-gray-600">@{user.username}</p>
                )}
              </div>
            )}

            {/* Profile Form */}
            {isEditing ? (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold text-gray-900">Редактировать профиль</h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Имя</label>
                  <Input
                    value={editProfile.name}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, name: e.target.value })
                    }
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Телефон</label>
                  <Input
                    value={editProfile.phone}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, phone: e.target.value })
                    }
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Email</label>
                  <Input
                    type="email"
                    value={editProfile.email}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, email: e.target.value })
                    }
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Специализация</label>
                  <Input
                    value={editProfile.specialization}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, specialization: e.target.value })
                    }
                    placeholder="Например: Кроссфит, Йога, Пауэрлифтинг"
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Опыт работы</label>
                  <Input
                    value={editProfile.experience}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, experience: e.target.value })
                    }
                    placeholder="Например: 5 лет"
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">О себе</label>
                  <textarea
                    value={editProfile.bio}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, bio: e.target.value })
                    }
                    placeholder="Расскажите о себе..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 text-sm resize-none"
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveProfile}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg flex items-center justify-center gap-2"
                  >
                    <Save size={18} />
                    Сохранить
                  </Button>
                  <Button
                    onClick={() => {
                      setEditProfile(profile);
                      setIsEditing(false);
                    }}
                    className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 rounded-lg"
                  >
                    Отмена
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Мой профиль</h2>
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2"
                  >
                    <Edit2 size={18} />
                    Редактировать
                  </Button>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">Имя</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.name || "Не указано"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Телефон</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.phone || "Не указано"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.email || "Не указано"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Специализация</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.specialization || "Не указано"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Опыт работы</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.experience || "Не указано"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">О себе</p>
                    <p className="text-lg font-semibold text-gray-900">{profile.bio || "Не указано"}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
