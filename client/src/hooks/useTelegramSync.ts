import { useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface SyncData {
  clients?: unknown[];
  exercises?: unknown[];
  schedule?: unknown[];
  profile?: unknown;
}

/**
 * Hook to sync NGFit Pro data with Telegram
 * Automatically syncs data to Telegram when it changes
 */
export function useTelegramSync() {
  const syncMutation = trpc.telegram.syncAllData.useMutation();
  const botStatus = trpc.telegram.getBotStatus.useQuery();

  const syncToTelegram = async (data: SyncData) => {
    try {
      await syncMutation.mutateAsync(data);
      return { success: true };
    } catch (error) {
      console.error("Failed to sync to Telegram:", error);
      return { success: false, error };
    }
  };

  const notifyWorkout = async (workoutName: string, time: string, clientName?: string) => {
    try {
      const notifyMutation = trpc.telegram.notifyWorkout.useMutation();
      await notifyMutation.mutateAsync({
        workoutName,
        time,
        clientName,
      });
      return { success: true };
    } catch (error) {
      console.error("Failed to send workout notification:", error);
      return { success: false, error };
    }
  };

  const utils = trpc.useUtils();

  const syncClientsFromServer = async () => {
    try {
      // Fetch latest clients from server DB
      const remoteClients = await utils.clients.list.fetch();

      // Get local clients
      const localClientsJson = localStorage.getItem("ngfit_clients");
      let localClients: any[] = localClientsJson ? JSON.parse(localClientsJson) : [];

      let addedCount = 0;
      let updatedCount = 0;

      // Merge logic: Server is source of truth for new clients
      remoteClients.forEach((remoteClient: any) => {
        // Try to find existing local client by ID (soft match) or Phone or Name
        const existingIndex = localClients.findIndex(local =>
          String(local.id) === String(remoteClient.id) ||
          (local.phone && remoteClient.phone && local.phone.replace(/\D/g, '') === remoteClient.phone.replace(/\D/g, '')) ||
          (local.name.trim().toLowerCase() === remoteClient.name.trim().toLowerCase())
        );

        const newClientData = {
          id: String(remoteClient.id), // Use server ID (stringified)
          name: remoteClient.name,
          phone: remoteClient.phone || "",
          email: remoteClient.email || "",
          birthDate: remoteClient.birthDate || "",
          experience: remoteClient.experience || "",
          injuries: remoteClient.injuries || "",
          contraindications: remoteClient.contraindications || "",
          chronicDiseases: remoteClient.chronicDiseases || "",
          badHabits: remoteClient.badHabits || "",
          goals: remoteClient.goals || "",
          gender: remoteClient.gender || "",
          height: remoteClient.height ? String(remoteClient.height) : "",
          weight: remoteClient.weight ? String(remoteClient.weight) : "",
        };

        if (existingIndex >= 0) {
          // Update existing
          // We merge, prioritizing server data if present, but keeping local ID if it's already set to server ID?
          // Actually, if we match by phone, we should update the ID to match server ID to ensure future sync consistency
          localClients[existingIndex] = { ...localClients[existingIndex], ...newClientData, id: localClients[existingIndex].id }; // For now keep local ID to break less links? 
          // Re-thinking: If we want "One Base", we should start using Server IDs. 
          // But workouts link to Client IDs. If I change Client ID, I break Workouts.

          // Better strategy for now: Update details, keep Local ID.
          // Store 'serverId' mapping if needed later.
          // For now, let's just update the content fields.
          localClients[existingIndex] = { ...localClients[existingIndex], ...newClientData, id: localClients[existingIndex].id };
          updatedCount++;
        } else {
          // Add new
          localClients.push(newClientData);
          addedCount++;
        }
      });

      // Save back to local storage
      localStorage.setItem("ngfit_clients", JSON.stringify(localClients));

      return { success: true, added: addedCount, updated: updatedCount };
    } catch (error) {
      console.error("Failed to sync clients from server:", error);
      return { success: false, error };
    }
  };

  return {
    syncToTelegram,
    notifyWorkout,
    syncClientsFromServer,
    isSyncing: syncMutation.isPending,
    botStatus: botStatus.data,
    isBotReady: botStatus.data?.ok === true,
  };
}
