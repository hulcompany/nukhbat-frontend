import { Track } from "./track";

export interface Subject {
  id: string;
  title: string;
  trackId: string;
  track: Track;
  createdAt: string; // ISO Date string
}

export interface SubjectsResponse {
  message: string;
  data: Subject[];
}
