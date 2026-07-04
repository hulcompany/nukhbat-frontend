export interface Unit {
  id: string;
  title: string;
  courseId: string;
  schoolId: string;
  index: number;
}

export interface UnitsResponse {
  message: string;
  data: Unit[];
}

export interface UnitResponse {
  message: string;
  data: Unit;
}
