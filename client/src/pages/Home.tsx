import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Dumbbell, Calendar, User, Bot, TrendingUp, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export default function Home() {
  const [, navigate] = useLocation();
  const [isTrainer, setIsTrainer] = useState(true); // Default to trainer for now

  // Check role on mount
  useEffect(() => {
    // Logic to determine if user is trainer or client
    // For now we check if "ngfit_trainer_profile" exists as a heuristic, 
    // but in a real app this should be more robust
    const trainerProfile = localStorage.getItem("ngfit_trainer_profile");
    // If we want to simulate client view for testing, we can toggle this
    setIsTrainer(!!trainerProfile);
  }, []);

  const trainerMenuItems = [
    { icon: Calendar, label: "Расписание", path: "/schedule", color: "from-blue-600 to-indigo-700" },
    { icon: Dumbbell, label: "Упражнения", path: "/exercises", color: "from-emerald-600 to-teal-700" },
    { icon: Users, label: "Клиенты", path: "/clients", color: "from-orange-500 to-red-600" },
    { icon: User, label: "Профиль", path: "/profile", color: "from-purple-600 to-violet-700" },
    { icon: Bot, label: "AI Ассистент", path: "/ai", color: "from-pink-500 to-rose-600" },
    { icon: TrendingUp, label: "Статистика", path: "/statistics", color: "from-cyan-600 to-blue-700" },
  ];

  const clientMenuItems = [
    { icon: Calendar, label: "Расписание", path: "/schedule", color: "from-blue-600 to-indigo-700" },
    { icon: Dumbbell, label: "Упражнения", path: "/exercises", color: "from-emerald-600 to-teal-700" },
    { icon: User, label: "Профиль", path: "/profile", color: "from-purple-600 to-violet-700" },
    { icon: TrendingUp, label: "Моя Статистика", path: "/statistics", color: "from-cyan-600 to-blue-700" },
  ];

  // Temporary toggle for testing (Double click on title to switch)
  const toggleRole = () => {
    setIsTrainer(!isTrainer);
  }

  const menuItems = isTrainer ? trainerMenuItems : clientMenuItems;

  return (
    <div className="min-h-screen w-full flex flex-col items-end justify-end p-4 relative">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-sm mb-12">
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-6 px-2">
          <h1
            className="text-3xl font-bold text-white drop-shadow-md cursor-pointer select-none"
            onDoubleClick={toggleRole}
            title="Double click to switch views (Dev)"
          >
            {isTrainer ? "Тренерская" : "Кабинет"}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Выйти из аккаунта?")) {
                localStorage.removeItem("ngfit_user");
                localStorage.removeItem("ngfit_trainer_profile");
                window.location.reload();
              }
            }}
            className="text-white/30 hover:text-white/80 hover:bg-transparent h-8 w-8"
            title="Выйти"
          >
            <LogOut size={20} />
          </Button>
        </div>

        {/* Menu Grid */}
        <div className={`grid ${isTrainer ? 'grid-cols-2' : 'grid-cols-2'} gap-4`}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`h-36 flex flex-col items-center justify-center gap-3 rounded-3xl bg-gradient-to-br ${item.color} shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-white font-bold border border-white/10`}
              >
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shadow-inner">
                  <Icon size={40} strokeWidth={1.5} />
                </div>
                <span className="text-sm text-center font-semibold tracking-wide">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
