import apiClient from "@/lib/axios";

export async function downloadFile(id: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(`/files/${id}`, {
    responseType: "blob",
  });
  return res.data;
}
