export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      weeks: {
        Row: Week
        Insert: Omit<Week, 'id' | 'created_at'>
        Update: Partial<Omit<Week, 'id' | 'created_at'>>
      }
      students: {
        Row: Student
        Insert: Omit<Student, 'id'>
        Update: Partial<Omit<Student, 'id'>>
      }
      groups: {
        Row: Group
        Insert: Omit<Group, 'id'>
        Update: Partial<Omit<Group, 'id'>>
      }
      evaluations: {
        Row: Evaluation
        Insert: Omit<Evaluation, 'id'>
        Update: Partial<Omit<Evaluation, 'id'>>
      }
    }
  }
}

export interface Week {
  id: string;
  code: string;
  institute_name: string;
  teacher_name: string;
  notes?: string;
  created_at: string;
}

export interface Student {
  id: string;
  week_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  photo_url?: string;
  qr_code_url?: string;
  group_id?: string;
  // UI-only properties for draft state
  photo_file?: File | null;
  photo_preview?: string;
}

export interface Group {
  id: string;
  week_id: string;
  name: string;
  color: string;
}

export interface Evaluation {
  id: string;
  student_id: string;
  skill_id: string;
  sub_criterion_id: string;
  score_value: number;
  updated_at: string;
}