import axios, { AxiosError } from "axios";
import { config } from "@/lib/config";
import { ApiError, ApiErrorResponse } from "@/lib/errors";

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((req) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

apiClient.interceptors.response.use(
  (res) => res,
  (error: AxiosError<ApiErrorResponse>) => {
    const code = error.response?.data?.code;
    return Promise.reject(new ApiError(code));
  }
);

export default apiClient;
