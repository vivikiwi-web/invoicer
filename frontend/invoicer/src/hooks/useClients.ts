import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Client } from "@shared/types";
import { clientsApi, type ClientPayload } from "@/api/clients";

export const clientsKey = ["clients"] as const;
export const clientKey = (id: string) => ["client", id] as const;

export function useClients() {
  return useQuery({ queryKey: clientsKey, queryFn: () => clientsApi.list() });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: clientKey(id || ""),
    queryFn: () => clientsApi.get(id ?? ""),
    enabled: !!id,
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>, id?: string) {
  qc.invalidateQueries({ queryKey: clientsKey });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  if (id) qc.invalidateQueries({ queryKey: clientKey(id) });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ClientPayload) => clientsApi.create(payload),
    onSuccess: () => invalidate(qc),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClientPayload }) =>
      clientsApi.update(id, payload),
    onSuccess: (c: Client) => invalidate(qc, c?.id),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: () => invalidate(qc),
  });
}
