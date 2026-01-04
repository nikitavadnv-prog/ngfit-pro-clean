import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Edit2 } from "lucide-react";

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  type: string;
}

export default function Exercises() {
  const [, navigate] = useLocation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    muscleGroup: "",
    type: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load exercises from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ngfit_exercises");
    if (saved) {
      setExercises(JSON.parse(saved));
    }
  }, []);

  // Save exercises to localStorage
  const saveExercises = (newExercises: Exercise[]) => {
    setExercises(newExercises);
    localStorage.setItem("ngfit_exercises", JSON.stringify(newExercises));
  };

  const handleAddExercise = () => {
    if (!formData.name || !formData.muscleGroup || !formData.type) {
      alert("Заполните все поля");
      return;
    }

    if (editingId) {
      const updated = exercises.map((e) =>
        e.id === editingId ? { ...e, ...formData } : e
      );
      saveExercises(updated);
      setEditingId(null);
    } else {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        ...formData,
      };
      saveExercises([...exercises, newExercise]);
    }

    setFormData({
      name: "",
      muscleGroup: "",
      type: "",
    });
  };

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup,
      type: exercise.type,
    });
    setEditingId(exercise.id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить упражнение?")) {
      saveExercises(exercises.filter((e) => e.id !== id));
    }
  };

  return (
    <div className="min-h-screen w-full p-4 relative">
      {/* Dark overlay */}
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
          <h1 className="text-3xl font-bold text-white">Упражнения</h1>
        </div>

        {/* Form */}
        <Card className="bg-white/95 backdrop-blur p-6 mb-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {editingId ? "Редактировать упражнение" : "Добавить упражнение"}
          </h2>

          <div className="space-y-3">
            <Input
              placeholder="Название упражнения"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-gray-50"
            />
            <Input
              placeholder="Группа мышц"
              value={formData.muscleGroup}
              onChange={(e) =>
                setFormData({ ...formData, muscleGroup: e.target.value })
              }
              className="bg-gray-50"
            />
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
            >
              <option value="">Тип упражнения</option>
              <option value="Односуставное">Односуставное</option>
              <option value="Многосуставное">Многосуставное</option>
              <option value="Кардио">Кардио</option>
              <option value="Растяжка">Растяжка</option>
            </select>

            <Button
              onClick={handleAddExercise}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold"
            >
              {editingId ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </Card>

        {/* Exercises List */}
        <div className="space-y-3">
          {exercises.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur p-8 text-center rounded-2xl">
              <p className="text-gray-600">Упражнений нет. Добавьте первое!</p>
            </Card>
          ) : (
            exercises.map((exercise) => (
              <Card
                key={exercise.id}
                className="bg-white/95 backdrop-blur p-4 rounded-xl flex justify-between items-start"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">
                    {exercise.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {exercise.muscleGroup}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{exercise.type}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(exercise)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(exercise.id)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={18} />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
