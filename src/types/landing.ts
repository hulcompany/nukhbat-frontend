export interface FaqItem {
  id: string;
  title: string;
  description: string;
}

export interface FaqResponse {
  message: string;
  data: FaqItem[];
}

export interface AppInfo {
  appStore: string;
  googlePlay: string;
  phone: string;
  location: string;
  position: Position;
  about: string;
  privacyPolicy: string;
  termsAndConditions: string;
}

export interface InfoResponse {
  message: string;
  data: AppInfo;
}

export interface Position {
  lat: number;
  lng: number;
}
// --- Request Interface ---

export interface UpdateInfoRequest {
  appStore: string;
  googlePlay: string;
  phone: string;
  location: string;
  position: Position;
  about: string;
  privacyPolicy: string;
  termsAndConditions: string;
}

export interface CreateFaqRequest {
  title: string;
  description: string;
}
