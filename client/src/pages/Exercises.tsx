import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Edit2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Exercise } from "@shared/types";

export default function Exercises() {
  const [, navigate] = useLocation();

  // TRPC Hooks
  const { data: exercises, isLoading, refetch } = trpc.fitness.getExercises.useQuery();
  const createExercise = trpc.fitness.createExercise.useMutation({
    onSuccess: () => {
      toast.success("Упражнение добавлено");
      refetch();
      resetForm();
    },
    onError: (err) => toast.error(`Ошибка: ${err.message}`),
  });
  const updateExercise = trpc.fitness.updateExercise.useMutation({
    onSuccess: () => {
      toast.success("Упражнение обновлено");
      refetch();
      setEditingId(null);
      resetForm();
    },
    onError: (err) => toast.error(`Ошибка: ${err.message}`),
  });
  const deleteExercise = trpc.fitness.deleteExercise.useMutation({
    onSuccess: () => {
      toast.success("Упражнение удалено");
      refetch();
    },
    onError: (err) => toast.error(`Ошибка: ${err.message}`),
  });

  const [formData, setFormData] = useState({
    name: "",
    muscleGroup: "",
    type: "",
  });
  const [editingId, setEditingId] = useState<number | null>(null);

  const resetForm = () => {
    setFormData({
      name: "",
      muscleGroup: "",
      type: "",
    });
  };

  const handleAddExercise = () => {
    if (!formData.name || !formData.muscleGroup || !formData.type) {
      toast.error("Заполните все поля");
      return;
    }

    if (editingId) {
      updateExercise.mutate({
        id: editingId,
        ...formData,
      });
    } else {
      createExercise.mutate(formData);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setFormData({
      name: exercise.name,
      muscleGroup: exercise.muscleGroup || "",
      type: exercise.type || "",
    });
    setEditingId(exercise.id);
  };

  const handleDelete = (id: number) => {
    if (confirm("Удалить упражнение?")) {
      deleteExercise.mutate(id);
    }
  };

  const isSubmitting = createExercise.isPending || updateExercise.isPending || deleteExercise.isPending;

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

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center mb-4">
            <Loader2 className="animate-spin text-white" />
          </div>
        )}

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
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-semibold"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : (editingId ? "Сохранить" : "Добавить")}
            </Button>
          </div>
        </Card>

        {/* Exercises List */}
        {!isLoading && (
          <div className="space-y-3">
            {exercises?.length === 0 ? (
              <Card className="bg-white/95 backdrop-blur p-8 text-center rounded-2xl">
                <p className="text-gray-600">Упражнений нет. Добавьте первое!</p>
              </Card>
            ) : (
              exercises?.map((exercise) => (
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
        )}
      </div>
    </div>
  );
}
