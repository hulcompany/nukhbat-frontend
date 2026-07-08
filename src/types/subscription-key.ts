import { Track } from "./track";

export interface CreateSubscriptionKeysRequest {
  trackId: string;
  schoolId: string;
  count: number;
}

export interface CreatedSubscriptionKey {
  key: string;
  trackId: string;
  track: { id: string };
  schoolId: string;
  school: { id: string };
}

export interface CreateSubscriptionKeysResponse {
  message: string;
  data: CreatedSubscriptionKey[];
}

export interface SubscriptionKeySchool {
  id: string;
  name: string;
  logo: string | null;
  default: boolean;
}

export interface SubscriptionKeyUser {
  id: string;
  name: string;
}

export interface SubscriptionKey {
  id: string;
  key: string;
  usedById: string | null;
  usedBy: SubscriptionKeyUser | null;
  trackId: string;
  track: Track;
  schoolId: string;
  school: SubscriptionKeySchool;
  createdAt: string; // ISO Date string
}

export interface SubscriptionKeyListData {
  list: SubscriptionKey[];
  next: boolean;
  back: boolean;
  totalRecords: number;
}

export interface SubscriptionKeyListResponse {
  message: string;
  data: SubscriptionKeyListData;
}

export interface BulkDeleteSubscriptionKeysRequest {
  ids: string[];
}

export interface BulkDeleteSubscriptionKeysResponse {
  message: string;
}
