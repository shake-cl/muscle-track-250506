import { create } from 'zustand';
import { db } from '../db/database';
import type { Exercise, MuscleGroup } from '../types';
import { nanoid } from 'nanoid';

interface ExerciseState {
  exercises: Exercise[];
  loaded: boolean;
  loadExercises: () => Promise<void>;
  addExercise: (name: string, muscleGroup: MuscleGroup) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  getById: (id: string) => Exercise | undefined;
}

export const useExerciseStore = create<ExerciseState>((set, get) => ({
  exercises: [],
  loaded: false,

  loadExercises: async () => {
    const exercises = await db.exercises.toArray();
    set({ exercises, loaded: true });
  },

  addExercise: async (name, muscleGroup) => {
    const exercise: Exercise = { id: `c_${nanoid(8)}`, name, muscleGroup, isCustom: true };
    await db.exercises.add(exercise);
    set((s) => ({ exercises: [...s.exercises, exercise] }));
  },

  deleteExercise: async (id) => {
    await db.exercises.delete(id);
    set((s) => ({ exercises: s.exercises.filter((e) => e.id !== id) }));
  },

  getById: (id) => get().exercises.find((e) => e.id === id),
}));
