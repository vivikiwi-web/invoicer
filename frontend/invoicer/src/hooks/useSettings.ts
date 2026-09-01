import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { CompanySettings } from "@shared/types";
import { settingsApi } from "@/api/settings";

export const settingsKey = ["settings"] as const;

export function useSettings() {
  return useQuery({ queryKey: settingsKey, queryFn: () => settingsApi.get() });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<CompanySettings>) => settingsApi.update(payload),
    onSuccess: (settings) => qc.setQueryData(settingsKey, settings),
  });
}
