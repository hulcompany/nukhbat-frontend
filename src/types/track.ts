export interface Track {
  id: string;
  name: string;
  createdAt: string;
}

export interface TracksResponse {
  message: string;
  data: Track[];
}
