import apiClient from "@/lib/axios";
import {
  FaqResponse,
  InfoResponse,
  CreateFaqRequest,
  UpdateInfoRequest,
} from "@/types/landing";

export const getFaqs = () =>
  apiClient.get<FaqResponse>("/public-content/faqs");

export const createFaq = (data: CreateFaqRequest) =>
  apiClient.post<FaqResponse>("/public-content/faqs", data);

export const updateFaq = (id: string, data: CreateFaqRequest) =>
  apiClient.patch<FaqResponse>(`/public-content/faqs/${id}`, data);

export const deleteFaq = (id: string) =>
  apiClient.delete(`/public-content/faqs/${id}`);

export const getInfo = () =>
  apiClient.get<InfoResponse>("/public-content/info");

export const updateInfo = (data: UpdateInfoRequest) =>
  apiClient.post<InfoResponse>("/public-content/info", data);
