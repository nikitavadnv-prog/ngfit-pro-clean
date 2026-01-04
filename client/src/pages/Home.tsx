import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Users, Dumbbell, Calendar, User } from "lucide-react";

export default function Home() {
  const [, navigate] = useLocation();

  const menuItems = [
    {
      icon: Calendar,
      label: "Расписание",
      path: "/schedule",
      color: "from-slate-700 to-slate-800",
    },
    {
      icon: Dumbbell,
      label: "Упражнения",
      path: "/exercises",
      color: "from-slate-700 to-slate-800",
    },
    {
      icon: Users,
      label: "Клиенты",
      path: "/clients",
      color: "from-slate-700 to-slate-800",
    },
    {
      icon: User,
      label: "Профиль",
      path: "/profile",
      color: "from-slate-700 to-slate-800",
    },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-end justify-end p-4 relative">
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full max-w-sm mb-12">
        {/* Menu Grid */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`h-40 flex flex-col items-center justify-center gap-4 rounded-3xl bg-gradient-to-br ${item.color} hover:shadow-2xl transition-all duration-300 transform hover:scale-110 text-white font-bold hover:from-slate-800 hover:to-slate-900 opacity-75 hover:opacity-100 border-2 border-white/20`}
              >
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                  <Icon size={48} strokeWidth={1.5} />
                </div>
                <span className="text-base text-center font-semibold">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
