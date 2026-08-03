export interface Notification {
  id: string;
  title: string;
  userId: string;
  description: string;
  createdAt: string;
  isRead: boolean;
  isOpen: boolean;
}

export interface NotificationsData {
  list: Notification[];
  next: boolean;
  back: boolean;
  totalRecords: number;
}

export interface GetNotificationsResponse {
  message: string;
  data: NotificationsData;
}

export interface GetNotificationsParams {
  skip?: number;
  limit?: number;
}

export interface SendNotification {
  title: string;
  description?: string | null;
  userId: string;
}

export interface SendNotificationResponse {
  message: string;
  data: Notification;
}
