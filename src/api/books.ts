import apiClient from "@/lib/axios";
import { BookResponse, BooksResponse, DeleteBookResponse } from "@/types/book";

export async function getMyBooks(): Promise<BooksResponse> {
  const res = await apiClient.get<BooksResponse>("/books/school");
  return res.data;
}

export async function createBook(data: {
  name: string;
  attachment: File;
}): Promise<BookResponse> {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("attachment", data.attachment);

  const res = await apiClient.post<BookResponse>("/books/school", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateBook(
  id: string,
  data: { name?: string; attachment?: File },
): Promise<BookResponse> {
  const formData = new FormData();
  if (data.name !== undefined) formData.append("name", data.name);
  if (data.attachment) formData.append("attachment", data.attachment);

  const res = await apiClient.patch<BookResponse>(
    `/books/school/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export async function deleteBook(id: string): Promise<DeleteBookResponse> {
  const res = await apiClient.delete<DeleteBookResponse>(`/books/school/${id}`);
  return res.data;
}
