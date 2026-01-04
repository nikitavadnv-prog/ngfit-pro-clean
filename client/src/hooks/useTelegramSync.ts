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

  return {
    syncToTelegram,
    notifyWorkout,
    isSyncing: syncMutation.isPending,
    botStatus: botStatus.data,
    isBotReady: botStatus.data?.ok === true,
  };
}
