import { UserListItem } from "./user";

export interface SubscriptionUser extends UserListItem {
  phoneNumber: string | null;
}

export interface SubscriptionStudentProfile {
  id: string;
  userId: string;
  user: SubscriptionUser;
  active: boolean;
  schoolId: string;
  trackId: string;
  createdAt: string; // ISO Date string
}

export interface Subscription {
  id: string;
  type: string; // e.g. "paid"
  expireDate: string; // ISO Date string
  studentProfileId: string;
  studentProfile: SubscriptionStudentProfile;
  createdAt: string; // ISO Date string
  isExpired: boolean;
}

export interface SubscriptionListData {
  list: Subscription[];
  next: boolean;
  back: boolean;
  totalRecords: number;
}

export interface SubscriptionListResponse {
  message: string;
  data: SubscriptionListData;
}
