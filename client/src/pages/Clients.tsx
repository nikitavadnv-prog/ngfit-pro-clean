import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Trash2, Edit2, Send, Eye } from "lucide-react";
import { useTelegramSync } from "@/hooks/useTelegramSync";
import { toast } from "sonner";

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
}

export default function Clients() {
  const [, navigate] = useLocation();
  const [clients, setClients] = useState<Client[]>([]);
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const { syncToTelegram, isSyncing } = useTelegramSync();

  // Load clients from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("ngfit_clients");
    if (saved) {
      setClients(JSON.parse(saved));
    }
  }, []);

  // Save clients to localStorage
  const saveClients = (newClients: Client[]) => {
    setClients(newClients);
    localStorage.setItem("ngfit_clients", JSON.stringify(newClients));
  };

  const handleAddClient = () => {
    if (!formData.name || !formData.phone || !formData.email) {
      toast.error("Заполните обязательные поля");
      return;
    }

    if (editingId) {
      const updated = clients.map((c) =>
        c.id === editingId ? { ...c, ...formData } : c
      );
      saveClients(updated);
      setEditingId(null);
      toast.success("Клиент обновлен");
    } else {
      const newClient: Client = {
        id: Date.now().toString(),
        ...formData,
      };
      saveClients([...clients, newClient]);
      toast.success("Клиент добавлен");
    }

    setFormData({
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
  };

  const handleEdit = (client: Client) => {
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email,
      birthDate: client.birthDate,
      experience: client.experience,
      injuries: client.injuries,
      contraindications: client.contraindications,
      chronicDiseases: client.chronicDiseases,
      badHabits: client.badHabits,
    });
    setEditingId(client.id);
  };

  const handleDelete = (id: string) => {
    if (confirm("Удалить клиента?")) {
      saveClients(clients.filter((c) => c.id !== id));
      toast.success("Клиент удален");
    }
  };

  const handleSyncToTelegram = async () => {
    const result = await syncToTelegram({ clients });
    if (result.success) {
      toast.success("Данные синхронизированы с Telegram!");
    } else {
      toast.error("Ошибка синхронизации");
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
          <h1 className="text-3xl font-bold text-white">Клиенты</h1>
        </div>

        {/* Sync Button */}
        {clients.length > 0 && (
          <Button
            onClick={handleSyncToTelegram}
            disabled={isSyncing}
            className="w-full mb-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold flex items-center justify-center gap-2"
          >
            <Send size={18} />
            {isSyncing ? "Синхронизация..." : "Синхронизировать с Telegram"}
          </Button>
        )}

        {/* Form */}
        <Card className="bg-white/95 backdrop-blur p-6 mb-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {editingId ? "Редактировать клиента" : "Добавить клиента"}
          </h2>

          <div className="space-y-3">
            <Input
              placeholder="ФИО"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="bg-gray-50"
            />
            <Input
              placeholder="Телефон"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="bg-gray-50"
            />
            <Input
              placeholder="Email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="bg-gray-50"
            />
            <Input
              placeholder="Дата рождения"
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className="bg-gray-50"
            />
            <select
              value={formData.experience}
              onChange={(e) =>
                setFormData({ ...formData, experience: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none h-20"
            />
            <textarea
              placeholder="Противопоказания"
              value={formData.contraindications}
              onChange={(e) =>
                setFormData({ ...formData, contraindications: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none h-20"
            />
            <textarea
              placeholder="Хронические заболевания"
              value={formData.chronicDiseases}
              onChange={(e) =>
                setFormData({ ...formData, chronicDiseases: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none h-20"
            />
            <textarea
              placeholder="Вредные привычки"
              value={formData.badHabits}
              onChange={(e) =>
                setFormData({ ...formData, badHabits: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 resize-none h-20"
            />

            <Button
              onClick={handleAddClient}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold"
            >
              {editingId ? "Сохранить" : "Добавить"}
            </Button>
          </div>
        </Card>

        {/* Clients List */}
        <div className="space-y-3">
          {clients.length === 0 ? (
            <Card className="bg-white/95 backdrop-blur p-8 text-center rounded-2xl">
              <p className="text-gray-600">Клиентов нет. Добавьте первого!</p>
            </Card>
          ) : (
            clients.map((client) => (
              <Card
                key={client.id}
                className="bg-white/95 backdrop-blur p-4 rounded-xl flex justify-between items-start"
              >
                <div
                  className="flex-1 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigate(`/clients/${client.id}`);
                  }}
                >
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    {client.name}
                    <Eye size={16} className="text-blue-500" />
                  </h3>
                  <p className="text-sm text-gray-600">{client.phone}</p>
                  <p className="text-sm text-gray-600">{client.email}</p>
                  {client.experience && (
                    <p className="text-xs text-gray-500 mt-1">
                      Опыт: {client.experience}
                    </p>
                  )}
                  {client.injuries && (
                    <p className="text-xs text-red-600 mt-1">
                      🩹 Травмы: {client.injuries}
                    </p>
                  )}
                  {client.contraindications && (
                    <p className="text-xs text-orange-600 mt-1">
                      ⚠️ Противопоказания: {client.contraindications}
                    </p>
                  )}
                  {client.chronicDiseases && (
                    <p className="text-xs text-yellow-600 mt-1">
                      💊 Заболевания: {client.chronicDiseases}
                    </p>
                  )}
                  {client.badHabits && (
                    <p className="text-xs text-gray-600 mt-1">
                      🚭 Привычки: {client.badHabits}
                    </p>
                  )}
                </div>
                <div className="flex gap-4 items-center pl-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(client)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit2 size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(client.id)}
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
