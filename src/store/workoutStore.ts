import { create } from 'zustand';
import { db } from '../db/database';
import type { WorkoutSession } from '../types';
import { format } from 'date-fns';

interface WorkoutState {
  sessions: WorkoutSession[];
  loaded: boolean;
  loadSessions: () => Promise<void>;
  addSession: (session: WorkoutSession) => Promise<void>;
  updateSession: (session: WorkoutSession) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  getSessionByDate: (date: string) => WorkoutSession | undefined;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  sessions: [],
  loaded: false,

  loadSessions: async () => {
    const sessions = await db.sessions.orderBy('date').reverse().toArray();
    set({ sessions, loaded: true });
  },

  addSession: async (session) => {
    await db.sessions.add(session);
    set((s) => ({ sessions: [session, ...s.sessions] }));
  },

  updateSession: async (session) => {
    await db.sessions.put(session);
    set((s) => ({
      sessions: s.sessions.map((x) => (x.id === session.id ? session : x)),
    }));
  },

  deleteSession: async (id) => {
    await db.sessions.delete(id);
    set((s) => ({ sessions: s.sessions.filter((x) => x.id !== id) }));
  },

  getSessionByDate: (date) => {
    return get().sessions.find((s) => s.date === date);
  },
}));

export const todayStr = () => format(new Date(), 'yyyy-MM-dd');
