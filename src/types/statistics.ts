export interface SchoolStatisticsData {
  totalStudents: number;
  blockedStudents: number;
  activeStudents: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  unusedKeys: number;
  openedTodayStudents: number;
  notOpenedTodayStudents: number;
}

export interface SchoolStatisticsResponse {
  message: string;
  data: SchoolStatisticsData;
}

export interface SubscriptionAggregateData {
  date: string;
  count: number;
}

export interface SubscriptionAggregateResponse {
  message: string;
  data: SubscriptionAggregateData[];
}

export interface AggregateActivityDay {
  date: string;
  openedStudents: number;
}

export interface AggregateActivityData {
  weekStart: string;
  weekEnd: string;
  week: AggregateActivityDay[];
}

export interface AggregateActivityResponse {
  message: string;
  data: AggregateActivityData;
}
