export interface Wisdom {
  id: string;
  text: string;
  selected: boolean;
  usedPreviously: boolean;
  createdAt: string; // ISO Date string
}

export interface WisdomListData {
  list: Wisdom[];
  next: boolean;
  back: boolean;
  totalRecords: number;
}

export interface WisdomListResponse {
  message: string;
  data: WisdomListData;
}

export interface WisdomResponse {
  message: string;
  data: Wisdom;
}

export interface CreateWisdomRequest {
  text: string;
}

export interface UpdateWisdomRequest {
  text: string;
}

export interface BulkDeleteWisdomRequest {
  ids: string[];
}

export interface BulkDeleteWisdomResponse {
  message: string;
}
