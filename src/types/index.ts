export type MuscleGroup = '胸' | '背中' | '脚' | '肩' | '腕' | '体幹' | 'その他';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  isCustom: boolean;
}

export interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: WorkoutSet[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  exercises: WorkoutExercise[];
  notes?: string;
  durationMin?: number;
}
