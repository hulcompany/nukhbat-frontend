import apiClient from "@/lib/axios";
import {
  BookResponse,
  BooksResponse,
  CreateBookRequest,
  DeleteBookResponse,
  UpdateBookRequest,
} from "@/types/book";

export async function getMyBooks(): Promise<BooksResponse> {
  const res = await apiClient.get<BooksResponse>("/books/school");
  return res.data;
}

export async function createBook(
  data: CreateBookRequest,
): Promise<BookResponse> {
  const res = await apiClient.post<BookResponse>("/books/school", data);
  return res.data;
}

export async function updateBook(
  id: string,
  data: UpdateBookRequest,
): Promise<BookResponse> {
  const res = await apiClient.patch<BookResponse>(`/books/school/${id}`, data);
  return res.data;
}

export async function deleteBook(id: string): Promise<DeleteBookResponse> {
  const res = await apiClient.delete<DeleteBookResponse>(`/books/school/${id}`);
  return res.data;
}
