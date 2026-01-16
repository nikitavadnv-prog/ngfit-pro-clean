import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ClientOnboarding() {
    const [location] = useLocation();
    const [submitted, setSubmitted] = useState(false);
    const [trainerId, setTrainerId] = useState<number | null>(null);

    // Extract trainerId from URL search params
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("trainerId");
        if (id) {
            setTrainerId(parseInt(id, 10));
        }
    }, []);

    const submitOnboarding = trpc.fitness.submitOnboarding.useMutation({
        onSuccess: () => {
            setSubmitted(true);
            toast.success("Анкета успешно отправлена!");
        },
        onError: (err) => {
            toast.error(`Ошибка при отправке: ${err.message}`);
        },
    });

    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        birthDate: "",
        experience: "",
        injuries: "",
        contraindications: "",
        chronicDiseases: "",
        badHabits: "",
    });

    const handleSubmit = () => {
        if (!trainerId) {
            toast.error("Не указан ID тренера (проверьте ссылку)");
            return;
        }
        if (!formData.name) {
            toast.error("Пожалуйста, укажите ваше имя");
            return;
        }

        submitOnboarding.mutate({
            trainerId,
            ...formData
        });
    };

    if (submitted) {
        return (
            <div className="min-h-screen w-full p-4 flex items-center justify-center relative">
                <div className="absolute inset-0 bg-black/60"></div>
                <Card className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur p-8 text-center rounded-2xl shadow-xl">
                    <div className="flex justify-center mb-4 text-green-500">
                        <CheckCircle2 size={64} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Готово!</h2>
                    <p className="text-gray-600">
                        Ваша анкета успешно отправлена тренеру.
                        Теперь вы можете закрыть это окно.
                    </p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full p-4 relative py-10">
            <div className="absolute inset-0 bg-black/50 fixed"></div>

            <div className="relative z-10 max-w-xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Анкета клиента</h1>
                    <p className="text-gray-200">
                        Заполните информацию о себе для составления плана тренировок
                    </p>
                </div>

                <Card className="bg-white/95 backdrop-blur p-6 rounded-2xl shadow-xl">
                    <div className="space-y-4">
                        <Input
                            placeholder="ФИО *"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            className="bg-gray-50 h-12 text-lg"
                        />
                        <Input
                            placeholder="Телефон"
                            value={formData.phone}
                            onChange={(e) =>
                                setFormData({ ...formData, phone: e.target.value })
                            }
                            className="bg-gray-50 h-12"
                        />
                        <Input
                            placeholder="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            className="bg-gray-50 h-12"
                        />

                        <div className="pt-2">
                            <label className="text-sm text-gray-500 ml-1 mb-1 block">Дата рождения</label>
                            <Input
                                placeholder="Дата рождения"
                                type="date"
                                value={formData.birthDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, birthDate: e.target.value })
                                }
                                className="bg-gray-50 h-12"
                            />
                        </div>

                        <select
                            value={formData.experience}
                            onChange={(e) =>
                                setFormData({ ...formData, experience: e.target.value })
                            }
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 h-12"
                        >
                            <option value="">Опыт тренировок</option>
                            <option value="Без опыта">Без опыта</option>
                            <option value="До 1 года">До 1 года</option>
                            <option value="1-3 года">1-3 года</option>
                            <option value="Более 3 лет">Более 3 лет</option>
                        </select>

                        <textarea
                            placeholder="Травмы (если есть)"
                            value={formData.injuries}
                            onChange={(e) =>
                                setFormData({ ...formData, injuries: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none h-24"
                        />
                        <textarea
                            placeholder="Противопоказания"
                            value={formData.contraindications}
                            onChange={(e) =>
                                setFormData({ ...formData, contraindications: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none h-24"
                        />
                        <textarea
                            placeholder="Хронические заболевания"
                            value={formData.chronicDiseases}
                            onChange={(e) =>
                                setFormData({ ...formData, chronicDiseases: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none h-24"
                        />
                        <textarea
                            placeholder="Вредные привычки"
                            value={formData.badHabits}
                            onChange={(e) =>
                                setFormData({ ...formData, badHabits: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none h-24"
                        />

                        <Button
                            onClick={handleSubmit}
                            disabled={submitOnboarding.isPending}
                            className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold shadow-lg mt-4"
                        >
                            {submitOnboarding.isPending ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                "Отправить анкету"
                            )}
                        </Button>

                        {!trainerId && (
                            <p className="text-center text-red-500 text-sm mt-2">
                                Внимание: Ссылка не содержит ID тренера. Данные могут не дойти.
                            </p>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
