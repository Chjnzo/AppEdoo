import { create } from 'zustand';
import { Week, Student, Group, Evaluation } from '@/types/database';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

const DEFAULT_GROUPS = [
  { id: 'g1', name: 'Gruppo Rosso', color: 'bg-red-500' },
  { id: 'g2', name: 'Gruppo Blu', color: 'bg-blue-500' },
  { id: 'g3', name: 'Gruppo Verde', color: 'bg-emerald-500' },
  { id: 'g4', name: 'Gruppo Giallo', color: 'bg-amber-500' },
  { id: 'g5', name: 'Gruppo Viola', color: 'bg-violet-500' },
  { id: 'g6', name: 'Gruppo Arancione', color: 'bg-orange-500' }
];

interface AppState {
  // Wizard State
  isWizardOpen: boolean;
  currentWizardStep: number;
  draftWeekDetails: Partial<Week>;
  draftStudents: Partial<Student>[];
  draftGroups: Partial<Group>[];
  
  // Active Data State
  activeWeek: Week | null;
  activeStudents: Student[];
  activeGroups: Group[];
  
  // Evaluation State
  pendingEvaluations: Record<string, Record<string, number>>;
  
  // Auth State
  user: User | null;
  session: Session | null;
  
  // Actions
  setWizardOpen: (open: boolean) => void;
  setWizardStep: (step: number) => void;
  updateDraftWeek: (details: Partial<Week>) => void;
  addDraftStudent: (student: Partial<Student>) => void;
  setDraftStudents: (students: Partial<Student>[]) => void;
  removeDraftStudent: (index: number) => void;
  setDraftGroups: (groups: Partial<Group>[]) => void;
  
  setActiveWeek: (week: Week | null) => void;
  setActiveStudents: (students: Student[]) => void;
  setActiveGroups: (groups: Group[]) => void;
  
  setPendingEvaluation: (studentId: string, criterionId: string, score: number) => void;
  clearPendingEvaluations: () => void;
  resetWizard: () => void;
  
  setUser: (user: User | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial State
  isWizardOpen: false,
  currentWizardStep: 1,
  draftWeekDetails: {},
  draftStudents: [],
  draftGroups: [...DEFAULT_GROUPS],
  
  activeWeek: null,
  activeStudents: [],
  activeGroups: [],
  
  pendingEvaluations: {},
  
  user: null,
  session: null,
  
  // Actions
  setWizardOpen: (open) => set({ isWizardOpen: open }),
  setWizardStep: (step) => set({ currentWizardStep: step }),
  
  updateDraftWeek: (details) => set((state) => ({
    draftWeekDetails: { ...state.draftWeekDetails, ...details }
  })),
  
  addDraftStudent: (student) => set((state) => ({
    draftStudents: [...state.draftStudents, { ...student, id: student.id || `temp-${Date.now()}-${Math.random()}` }]
  })),

  setDraftStudents: (students) => set({ draftStudents: students }),
  
  removeDraftStudent: (index) => set((state) => ({
    draftStudents: state.draftStudents.filter((_, i) => i !== index)
  })),
  
  setDraftGroups: (groups) => set({ draftGroups: groups }),
  
  setActiveWeek: (week) => set({ activeWeek: week }),
  setActiveStudents: (students) => set({ activeStudents: students }),
  setActiveGroups: (groups) => set({ activeGroups: groups }),
  
  setPendingEvaluation: (studentId, criterionId, score) => set((state) => ({
    pendingEvaluations: {
      ...state.pendingEvaluations,
      [studentId]: {
        ...(state.pendingEvaluations[studentId] || {}),
        [criterionId]: score
      }
    }
  })),
  
  clearPendingEvaluations: () => set({ pendingEvaluations: {} }),
  
  resetWizard: () => set({
    currentWizardStep: 1,
    draftWeekDetails: {},
    draftStudents: [],
    draftGroups: [...DEFAULT_GROUPS]
  }),
  
  setUser: (user) => set({ user }),
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    set({ user: null, session: null });
  },
}));

// Hydration: check for existing session on mount
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data }) => {
    if (data && data.session) {
      useAppStore.getState().setUser(data.session.user);
    }
  });
}