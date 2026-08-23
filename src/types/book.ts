export interface Book {
  id: string;
  name: string;
  text: string;
  lessonId: string;
  lesson?: {
    id: string;
  };
  school?: {
    id: string;
  };
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

// New interface for the update request body
export interface UpdateBookRequest {
  name?: string;
  text?: string;
  lessonId?: string;
}

export interface CreateBookRequest {
  name: string;
  text: string;
  lessonId: string;
}
