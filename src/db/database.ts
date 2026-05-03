import Dexie, { type Table } from 'dexie';
import type { Exercise, WorkoutSession } from '../types';
import { PRESET_EXERCISES } from '../data/presetExercises';

export class MuscleTrackDB extends Dexie {
  exercises!: Table<Exercise>;
  sessions!: Table<WorkoutSession>;

  constructor() {
    super('MuscleTrackDB');
    this.version(1).stores({
      exercises: 'id, name, muscleGroup, isCustom',
      sessions: 'id, date',
    });
  }
}

export const db = new MuscleTrackDB();

db.on('ready', async () => {
  const count = await db.exercises.count();
  if (count === 0) {
    await db.exercises.bulkAdd(PRESET_EXERCISES);
  }
});
