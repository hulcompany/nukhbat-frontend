import apiClient from "@/lib/axios";
import {
  GetNotificationsParams,
  GetNotificationsResponse,
  SendNotification,
  SendNotificationResponse,
} from "@/types/notification";

// ---- For Admin ---
export async function sendNotification(
  data: SendNotification,
): Promise<SendNotificationResponse> {
  console.log(data);
  const res = await apiClient.post<SendNotificationResponse>(
    `/notifications/send`,
    data,
  );

  return res.data;
}

// ---- For School ----
export async function getMyNotifications(
  params: GetNotificationsParams = { skip: 0, limit: 10 },
): Promise<GetNotificationsResponse> {
  const res = await apiClient.get<GetNotificationsResponse>(
    "/notifications/me",
    {
      params,
    },
  );
  return res.data;
}
