import apiClient from "@/lib/axios";
import {
  QuestionResponse,
  QuestionsResponse,
  QuestionType,
  QuestionPurpose,
  QuestionOptionGroupInput,
  QuestionMatchItemInput,
  BulkCreateQuestionsRequest,
  BulkCreateQuestionsResponse,
  BulkDeleteQuestionsResponse,
  QuestionFillBlankInput,
  QuestionOrderItemInput,
  ClassifyItemInput,
} from "@/types/question";

function appendTips(formData: FormData, tips?: string[]) {
  if (!tips) return;
  tips.forEach((tip, i) => {
    formData.append(`tips[${i}]`, tip);
  });
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
  optionGroups?: QuestionOptionGroupInput[];
  matchingItems?: QuestionMatchItemInput[];
  correctAnswer?: boolean;
  tips?: string[];

  // الأنواع الجديدة
  fillBlanks?: QuestionFillBlankInput[];
  orders?: QuestionOrderItemInput[];
  classify?: ClassifyItemInput[];
}): Promise<QuestionResponse> {
  const { image, ...payload } = data;
  const created = await apiClient.post<QuestionResponse>(
    "/curriculum/school/questions",
    payload,
  );

  if (!image) return created.data;

  return updateQuestion(created.data.data.id, { image });
}

export async function updateQuestion(
  id: string,
  data: {
    title?: string;
    image?: File;
    tips?: string[];
  },
): Promise<QuestionResponse> {
  const formData = new FormData();
  if (data.title !== undefined) formData.append("title", data.title);
  if (data.image) formData.append("image", data.image);
  appendTips(formData, data.tips);

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
