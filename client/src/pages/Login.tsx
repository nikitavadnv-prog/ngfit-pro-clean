import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already logged in
    const user = localStorage.getItem("ngfit_user");
    if (user) {
      navigate("/");
    }
  }, [navigate]);

  const handleTelegramLogin = async () => {
    setLoading(true);
    setError("");

    try {
      const tg = (window as any).Telegram?.WebApp;
      if (!tg) {
        setError("Telegram WebApp не доступен. Откройте приложение через Telegram бота.");
        setLoading(false);
        return;
      }

      const user = tg.initDataUnsafe?.user;
      if (!user) {
        setError("Не удалось получить данные Telegram пользователя.");
        setLoading(false);
        return;
      }

      // Save user data
      const userData = {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name || "",
        username: user.username || "",
        photoUrl: user.photo_url || "",
        loginTime: new Date().toISOString(),
      };

      localStorage.setItem("ngfit_user", JSON.stringify(userData));
      
      // Initialize trainer profile if not exists
      const existingProfile = localStorage.getItem("ngfit_trainer_profile");
      if (!existingProfile) {
        const trainerProfile = {
          name: `${user.first_name} ${user.last_name || ""}`.trim(),
          phone: "",
          email: "",
          specialization: "",
          experience: "",
          bio: "",
        };
        localStorage.setItem("ngfit_trainer_profile", JSON.stringify(trainerProfile));
      }

      navigate("/");
    } catch (err) {
      setError("Ошибка при входе. Попробуйте еще раз.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full p-4 relative flex items-center justify-center">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-10 max-w-md w-full">
        <Card className="bg-white/95 backdrop-blur p-8 rounded-2xl text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">NGFit Pro</h1>
            <p className="text-gray-600">Приложение для управления тренировками</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <Button
            onClick={handleTelegramLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Вход...
              </>
            ) : (
              <>
                <span>📱</span>
                Войти через Telegram
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 mt-6">
            Нажимая кнопку, вы подтверждаете, что используете это приложение только для личных целей.
          </p>
        </Card>
      </div>
    </div>
  );
}
