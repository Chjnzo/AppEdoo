import { create } from 'zustand';
import { Week, Student, Group, Evaluation } from '@/types/database';

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
  
  // Evaluation State (Optimistic Updates)
  pendingEvaluations: Record<string, Record<string, number>>; // studentId -> { criterionId: score }

  // Actions
  setWizardOpen: (open: boolean) => void;
  setWizardStep: (step: number) => void;
  updateDraftWeek: (details: Partial<Week>) => void;
  addDraftStudent: (student: Partial<Student>) => void;
  removeDraftStudent: (index: number) => void;
  setDraftGroups: (groups: Partial<Group>[]) => void;
  
  setActiveWeek: (week: Week | null) => void;
  setActiveStudents: (students: Student[]) => void;
  setActiveGroups: (groups: Group[]) => void;
  
  setPendingEvaluation: (studentId: string, criterionId: string, score: number) => void;
  clearPendingEvaluations: () => void;
  resetWizard: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial State
  isWizardOpen: false,
  currentWizardStep: 1,
  draftWeekDetails: {},
  draftStudents: [],
  draftGroups: [],
  
  activeWeek: null,
  activeStudents: [],
  activeGroups: [],
  
  pendingEvaluations: {},

  // Actions
  setWizardOpen: (open) => set({ isWizardOpen: open }),
  setWizardStep: (step) => set({ currentWizardStep: step }),
  
  updateDraftWeek: (details) => set((state) => ({
    draftWeekDetails: { ...state.draftWeekDetails, ...details }
  })),
  
  addDraftStudent: (student) => set((state) => ({
    draftStudents: [...state.draftStudents, student]
  })),
  
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
    draftGroups: []
  })
}));