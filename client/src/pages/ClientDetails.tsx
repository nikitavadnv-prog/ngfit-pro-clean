import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Edit2, Calendar, Phone, Mail, Award, Activity, Heart, AlertTriangle, AlertOctagon } from "lucide-react";

interface Client {
    id: string;
    name: string;
    phone: string;
    email: string;
    birthDate: string;
    experience: string;
    injuries: string;
    contraindications: string;
    chronicDiseases: string;
    badHabits: string;
    goals?: string;
    height?: number;
    weight?: number;
    gender?: string;
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

export default function ClientDetails() {
    const [, params] = useRoute("/clients/:id");
    const [, navigate] = useLocation();
    const [client, setClient] = useState<Client | null>(null);
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [exercises, setExercises] = useState<any[]>([]);

    useEffect(() => {
        if (!params?.id) return;

        const savedClients = localStorage.getItem("ngfit_clients");
        const savedWorkouts = localStorage.getItem("ngfit_workouts");
        const savedExercises = localStorage.getItem("ngfit_exercises");

        if (savedClients) {
            const allClients = JSON.parse(savedClients);
            const found = allClients.find((c: Client) => c.id === params.id);
            setClient(found || null);
        }

        if (savedWorkouts) {
            const allWorkouts = JSON.parse(savedWorkouts);
            const clientWorkouts = allWorkouts.filter((w: Workout) => w.clientId === params.id);
            setWorkouts(clientWorkouts);
        }

        if (savedExercises) {
            setExercises(JSON.parse(savedExercises));
        }
    }, [params?.id]);

    const getExerciseName = (id: string) => {
        return exercises.find(e => e.id === id)?.name || "Неизвестное упражнение";
    };

    const getAge = (birthDate: string) => {
        if (!birthDate) return "Не указан";
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    };

    if (!client) {
        return (
            <div className="min-h-screen w-full p-4 flex flex-col items-center justify-center text-white space-y-4">
                <h2 className="text-xl font-bold">Клиент не найден</h2>
                <Button onClick={() => navigate("/clients")}>
                    Вернуться к списку
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full p-4 relative">
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/50"></div>

            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/clients")}
                        className="text-white hover:bg-white/20"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <h1 className="text-3xl font-bold text-white max-w-[80%] truncate">{client.name}</h1>
                </div>

                {/* Client Info Card */}
                <Card className="bg-white/95 backdrop-blur p-6 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-gray-700">
                                <Phone size={18} className="text-blue-500" />
                                <span className="font-medium">{client.phone}</span>
                            </div>
                            {client.email && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Mail size={18} className="text-blue-500" />
                                    <span>{client.email}</span>
                                </div>
                            )}
                            {client.birthDate && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Calendar size={18} className="text-blue-500" />
                                    <span>{getAge(client.birthDate)} лет ({new Date(client.birthDate).toLocaleDateString("ru-RU")})</span>
                                </div>
                            )}
                            {client.experience && (
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Award size={18} className="text-amber-500" />
                                    <span>Опыт: {client.experience}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {client.goals && (
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-1">
                                        <Activity size={16} /> Цели
                                    </h4>
                                    <p className="text-sm text-green-900">{client.goals}</p>
                                </div>
                            )}

                            {client.injuries && (
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-1">
                                        <Heart size={16} /> Травмы
                                    </h4>
                                    <p className="text-sm text-red-900">{client.injuries}</p>
                                </div>
                            )}

                            {(client.contraindications || client.chronicDiseases) && (
                                <div className="bg-orange-50 p-3 rounded-lg">
                                    <h4 className="font-semibold text-orange-800 flex items-center gap-2 mb-1">
                                        <AlertOctagon size={16} /> Ограничения
                                    </h4>
                                    {client.contraindications && <p className="text-sm text-orange-900">Противопоказания: {client.contraindications}</p>}
                                    {client.chronicDiseases && <p className="text-sm text-orange-900 mt-1">Заболевания: {client.chronicDiseases}</p>}
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Workouts History */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-white">История тренировок</h2>
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
                                        </div>
                                    </div>

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
            </div>
        </div>
    );
}
