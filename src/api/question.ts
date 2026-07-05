import apiClient from "@/lib/axios";
import {
  QuestionResponse,
  QuestionsResponse,
  QuestionType,
  QuestionOptionInput,
  QuestionMatchItemInput,
} from "@/types/question";

function appendAnswers(
  formData: FormData,
  type: QuestionType,
  options?: QuestionOptionInput[],
  matchingItems?: QuestionMatchItemInput[],
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
}

export interface GetQuestionsParams {
  lessonId?: string;
  courseId?: string;
  skip?: number;
  limit?: number;
  title?: string;
}

export async function getLessonQuestions(
  params: GetQuestionsParams,
): Promise<QuestionsResponse> {
  console.log("/learning/school/questions", { params });
  const res = await apiClient.get<QuestionsResponse>(
    "/learning/school/questions",
    { params },
  );
  return res.data;
}

export async function getQuestionById(id: string): Promise<QuestionResponse> {
  const res = await apiClient.get<QuestionResponse>(
    `/learning/school/questions/${id}`,
  );
  return res.data;
}

export async function createQuestion(data: {
  title: string;
  type: QuestionType;
  lessonId?: string;
  courseId?: string;
  image?: File;
  options?: QuestionOptionInput[];
  matchingItems?: QuestionMatchItemInput[];
}): Promise<QuestionResponse> {
  const formData = new FormData();
  formData.append("title", data.title);
  if (data.lessonId) formData.append("lessonId", data.lessonId);
  if (data.courseId) formData.append("courseId", data.courseId);
  if (data.image) formData.append("image", data.image);
  appendAnswers(formData, data.type, data.options, data.matchingItems);
  const res = await apiClient.post<QuestionResponse>(
    "/learning/school/questions",
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
    type?: QuestionType;
    options?: QuestionOptionInput[];
    matchingItems?: QuestionMatchItemInput[];
  },
): Promise<QuestionResponse> {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.image) formData.append("image", data.image);
  if (data.type) {
    appendAnswers(formData, data.type, data.options, data.matchingItems);
  }

  const res = await apiClient.patch<QuestionResponse>(
    `/learning/school/questions/${id}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data;
}

export async function deleteQuestion(id: string): Promise<void> {
  await apiClient.delete(`/learning/school/questions/${id}`);
}

export async function reorderQuestions(
  lessonId: string,
  ids: string[],
): Promise<void> {
  await apiClient.post(`/learning/school/questions/order/${lessonId}`, { ids });
}
