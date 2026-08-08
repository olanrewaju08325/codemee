export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content: string;
  video_url: string | null;
  order_index: number;
}

export interface Assignment {
  id: string;
  module_id: string;
  title: string;
  description: string;
}

export interface Quiz {
  id: string;
  module_id: string;
  title: string;
  scheduled_at: string | null;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  order_index: number;
  is_published: boolean;
  lessons?: Lesson[];
  assignments?: Assignment[];
  quizzes?: Quiz[];
}

export interface Course {
  id: string;
  title: string;
  status?: string;
  description: string;
  price: number;
  currency: string;
  language: string;
  level: string;
  duration_weeks: number;
  is_active: boolean;
}
