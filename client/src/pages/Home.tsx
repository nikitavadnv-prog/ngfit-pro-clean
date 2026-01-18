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
        {/* Header with Logout */}
        <div className="flex justify-between items-center mb-6 px-2">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Меню</h1>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" /></svg>
          </Button>
        </div>

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
