import apiClient from "@/lib/axios";
import {
  QuestionResponse,
  QuestionsResponse,
  QuestionType,
  QuestionPurpose,
  QuestionOptionInput,
  QuestionMatchItemInput,
  BulkCreateQuestionsRequest,
  BulkCreateQuestionsResponse,
  BulkDeleteQuestionsResponse,
} from "@/types/question";

function appendAnswers(
  formData: FormData,
  type: QuestionType,
  options?: QuestionOptionInput[],
  matchingItems?: QuestionMatchItemInput[],
  correctAnswer?: boolean,
) {
  formData.append("type", type);
  if (type === "options" && options) {
    options.forEach((option, i) => {
      formData.append(`options[${i}][text]`, option.text);
      formData.append(`options[${i}][isCorrect]`, String(option.isCorrect));
    });
  }
  if (type === "match" && matchingItems) {
    matchingItems.forEach((item, i) => {
      formData.append(`matchingItems[${i}][text]`, item.text);
      formData.append(`matchingItems[${i}][type]`, item.type);
      if (item.correctIndex !== undefined) {
        formData.append(
          `matchingItems[${i}][correctIndex]`,
          String(item.correctIndex),
        );
      }
    });
  }
  if (type === "trueFalse" && correctAnswer !== undefined) {
    formData.append("correctAnswer", String(correctAnswer));
  }
}

export interface GetQuestionsParams {
  lessonId?: string;
  courseId?: string;
  skip?: number;
  limit?: number;
  title?: string;
}
// --------- For School ---------

export async function getLessonQuestions(
  params: GetQuestionsParams,
): Promise<QuestionsResponse> {
  const res = await apiClient.get<QuestionsResponse>(
    "/curriculum/school/questions",
    {
      params,
    },
  );
  return res.data;
}

export async function getQuestionById(id: string): Promise<QuestionResponse> {
  const res = await apiClient.get<QuestionResponse>(
    `/curriculum/school/questions/${id}`,
  );
  return res.data;
}

export async function createQuestion(data: {
  title: string;
  type: QuestionType;
  lessonId?: string;
  courseId?: string;
  purpose?: QuestionPurpose;
  image?: File;
  options?: QuestionOptionInput[];
  matchingItems?: QuestionMatchItemInput[];
  correctAnswer?: boolean;
}): Promise<QuestionResponse> {
  const formData = new FormData();
  formData.append("title", data.title);
  if (data.lessonId) formData.append("lessonId", data.lessonId);
  if (data.courseId) formData.append("courseId", data.courseId);
  if (data.purpose) formData.append("purpose", data.purpose);
  if (data.image) formData.append("image", data.image);
  appendAnswers(
    formData,
    data.type,
    data.options,
    data.matchingItems,
    data.correctAnswer,
  );
  const res = await apiClient.post<QuestionResponse>(
    "/curriculum/school/questions",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return res.data;
}

export async function updateQuestion(
  id: string,
  data: {
    title?: string;
    image?: File;
    // type?: QuestionType;
    // options?: QuestionOptionInput[];
    // matchingItems?: QuestionMatchItemInput[];
    // correctAnswer?: boolean;
  },
): Promise<QuestionResponse> {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.image) formData.append("image", data.image);
  // if (data.type) {
  //   appendAnswers(
  //     formData,
  //     data.type,
  //     data.options,
  //     data.matchingItems,
  //     data.correctAnswer,
  //   );
  // }

  const res = await apiClient.patch<QuestionResponse>(
    `/curriculum/school/questions/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export async function deleteQuestionImage(id: string): Promise<void> {
  await apiClient.delete(`/curriculum/school/questions/${id}/deleteImage`);
}

export async function bulkCreateQuestions(
  data: BulkCreateQuestionsRequest,
): Promise<BulkCreateQuestionsResponse> {
  const res = await apiClient.post<BulkCreateQuestionsResponse>(
    "/curriculum/school/questions/bulk",
    data,
  );
  return res.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await apiClient.delete(`/curriculum/school/questions/${id}`);
}

export async function bulkDeleteQuestions(
  ids: string[],
): Promise<BulkDeleteQuestionsResponse> {
  const res = await apiClient.post<BulkDeleteQuestionsResponse>(
    "/curriculum/school/questions/bulk-delete",
    { ids },
  );
  return res.data;
}
