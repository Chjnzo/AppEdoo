// Ensure Student type is defined
interface Student {
  id: string;
  first_name: string;
  last_name: string;
  // Add other properties as needed
}

// Ensure setDraftStudents is in AppState type
interface AppState {
// ... existing state
  setDraftStudents: (students: Partial<Student>[]) => void,
  // ... rest of state
}