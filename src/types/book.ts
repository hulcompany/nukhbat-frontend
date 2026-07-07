export interface Book {
  id: string;
  name: string;
  attachment: string;
}

export interface BooksResponse {
  message: string;
  data: Book[];
}

export interface BookResponse {
  message: string;
  data: Book;
}

export interface DeleteBookResponse {
  message: string;
}
