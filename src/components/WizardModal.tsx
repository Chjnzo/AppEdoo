"use client";

import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, Check, Users, ClipboardList, LayoutGrid, Plus, Trash2, UserPlus, Camera, X, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import Step3Groups from '@/components/wizard/Step3Groups';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const MOCK_NAMES = [
  ['Marco', 'Rossi'], ['Giulia', 'Bianchi'], ['Alessandro', 'Esposito'], ['Sofia', 'Ricci'], ['Francesco', 'Marino'],
  ['Alice', 'Greco'], ['Lorenzo', 'Bruno'], ['Emma', 'Gallo'], ['Matteo', 'Conti'], ['Chiara', 'De Luca'],
  ['Gabriele', 'Mancini'], ['Giorgia', 'Costa'], ['Riccardo', 'Giordano'], ['Martina', 'Rizzo'], ['Davide', 'Lombardi'],
  ['Gaia', 'Moretti'], ['Tommaso', 'Barbieri'], ['Beatrice', 'Fontana'], ['Federico', 'Santoro'], ['Ginevra', 'Mariani'],
  ['Andrea', 'Rinaldi'], ['Elena', 'Caruso'], ['Simone', 'Ferrara'], ['Sara', 'Galli'], ['Luca', 'Martini'],
  ['Aurora', 'Leone'], ['Edoardo', 'Longo'], ['Ludovica', 'Gentile'], ['Pietro', 'Martinelli'], ['Vittoria', 'Vitale']
];

const MOCK_CLASS = MOCK_NAMES.map(([first, last], i) => ({
  id: `mock-${i}`,
  first_name: first,
  last_name: last,
  photo_preview: `https://api.dicebear.com/7.x/avataaars/svg?seed=mock-${i}`
}));

interface WizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WizardModal = ({ open, onOpenChange }: WizardModalProps) => {
  const { 
    currentWizardStep, 
    setWizardStep, 
    draftWeekDetails, 
    updateDraftWeek,
    draftStudents,
    setDraftStudents,
    addDraftStudent,
    removeDraftStudent,
    draftGroups,
    resetWizard 
  } = useAppStore();

  const [newStudent, setNewStudent] = useState({ first_name: '', last_name: '', photo_file: null as File | null, photo_preview: '' });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const nextStep = () => setWizardStep(Math.min(currentWizardStep + 1, 3));
  const prevStep = () => setWizardStep(Math.max(currentWizardStep - 1, 1));

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewStudent({ ...newStudent, photo_file: file, photo_preview: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStudent = () => {
    if (newStudent.first_name && newStudent.last_name) {
      addDraftStudent({
        first_name: newStudent.first_name,
        last_name: newStudent.last_name,
        photo_file: newStudent.photo_file,
        photo_preview: newStudent.photo_preview
      });
      setNewStudent({ first_name: '', last_name: '', photo_file: null, photo_preview: '' });
    }
  };

  const handleFinish = async () => {
    if (!draftWeekDetails.code || !draftWeekDetails.institute_name) {
      showError("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    const toastId = showLoading("Creating your educational week...");
    let createdWeekId = null;

    try {
      // 1. Create Week
      const { data: week, error: weekError } = await (supabase
        .from('weeks') as any)
        .insert([{ 
          code: draftWeekDetails.code, 
          institute_name: draftWeekDetails.institute_name,
          teacher_name: 'Current Teacher'
        }])
        .select()
        .single();

      if (weekError || !week) throw weekError || new Error("Failed to create week");
      createdWeekId = week.id;

      // 2. Create Groups
      const groupsToInsert = draftGroups.map(g => ({ 
        name: g.name, 
        color: g.color, 
        week_id: week.id 
      }));

      const { data: createdGroups, error: groupsError } = await (supabase
        .from('groups') as any)
        .insert(groupsToInsert)
        .select();

      if (groupsError || !createdGroups) throw groupsError || new Error("Failed to create groups");

      // 3. Create Group ID Map
      const groupIdMap: Record<string, string> = {};
      draftGroups.forEach((g, index) => {
        if (createdGroups[index]) {
          groupIdMap[g.id] = createdGroups[index].id;
        }
      });

      // 4. Upload Photos & Create Students
      const studentsToInsert = await Promise.all(draftStudents.map(async (s) => {
        let photoUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`;
        
        if (s.photo_file) {
          const fileName = `${week.id}/${Date.now()}-${s.photo_file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('student_photos')
            .upload(fileName, s.photo_file);
            
          if (!uploadError && uploadData) {
            const { data: { publicUrl } } = supabase.storage
              .from('student_photos')
              .getPublicUrl(fileName);
            photoUrl = publicUrl;
          }
        } else if (s.photo_preview && !s.photo_preview.startsWith('data:')) {
          // If it's a mock student or has an existing URL
          photoUrl = s.photo_preview;
        }

        return { 
          first_name: s.first_name || '', 
          last_name: s.last_name || '', 
          week_id: week.id, 
          group_id: s.group_id ? groupIdMap[s.group_id] : null,
          photo_url: photoUrl
        };
      }));

      const { error: studentsError } = await (supabase
        .from('students') as any)
        .insert(studentsToInsert);

      if (studentsError) throw studentsError;

      showSuccess("Week created successfully!");
      handleClose(false);
    } catch (error: any) {
      console.error("[WizardModal] Submission failed:", error);
      if (createdWeekId) {
        await supabase.from('weeks').delete().eq('id', createdWeekId);
      }
      showError("Errore durante il salvataggio. Dati annullati.");
    } finally {
      setIsSaving(false);
      dismissToast(toastId);
    }
  };

  const steps = [
    { id: 1, title: 'Registry', icon: ClipboardList },
    { id: 2, title: 'Students', icon: Users },
    { id: 3, title: 'Groups', icon: LayoutGrid },
  ];

  const handleClose = (isOpen: boolean) => {
    onOpenChange(isOpen);
    if (!isOpen) {
      setTimeout(resetWizard, 300);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="w-[95vw] max-w-[1200px] rounded-[2.5rem] border-white/20 bg-white/80 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 overflow-hidden max-h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-8 pb-4 shrink-0">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {currentWizardStep === 1 && "Create New Week"}
            {currentWizardStep === 2 && "Add Students"}
            {currentWizardStep === 3 && "Assign Groups"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-8 pt-0 no-scrollbar">
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-2">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    currentWizardStep >= s.id ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-400"
                  )}>
                    {currentWizardStep > s.id ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    currentWizardStep === s.id ? "text-zinc-900" : "text-zinc-400"
                  )}>
                    {s.title}
                  </span>
                  {s.id < 3 && <div className="w-8 h-[1px] bg-zinc-100 mx-2" />}
                </div>
              ))}
            </div>
          </div>

          <div className="py-2 px-1">
            {currentWizardStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-bold text-zinc-700">Week Code</Label>
                  <Input 
                    id="code" 
                    placeholder="e.g. WK-2024-01" 
                    className="h-12 rounded-2xl bg-zinc-50 border-zinc-100"
                    value={draftWeekDetails.code || ''}
                    onChange={(e) => updateDraftWeek({ code: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institute" className="text-sm font-bold text-zinc-700">Institute Name</Label>
                  <Input 
                    id="institute" 
                    placeholder="e.g. Silicon Valley Academy" 
                    className="h-12 rounded-2xl bg-zinc-50 border-zinc-100"
                    value={draftWeekDetails.institute_name || ''}
                    onChange={(e) => updateDraftWeek({ institute_name: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentWizardStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                {/* Compact horizontal add-student row */}
                <div className="flex items-center gap-3 bg-white/60 border border-zinc-100 rounded-3xl p-3 shadow-sm">
                  {/* Camera / photo preview button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-11 h-11 shrink-0 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center hover:bg-zinc-200 transition-colors overflow-hidden"
                  >
                    {newStudent.photo_preview ? (
                      <img src={newStudent.photo_preview} className="w-full h-full object-cover" alt="preview" />
                    ) : (
                      <Camera className="h-4 w-4 text-zinc-400" />
                    )}
                  </button>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />

                  {/* Name inputs */}
                  <Input
                    placeholder="Nome"
                    className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 flex-1"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                  />
                  <Input
                    placeholder="Cognome"
                    className="h-11 rounded-2xl bg-zinc-50 border-zinc-100 flex-1"
                    value={newStudent.last_name}
                    onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                  />

                  {/* Add button */}
                  <Button
                    onClick={handleAddStudent}
                    className="h-11 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shrink-0"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Aggiungi
                  </Button>

                  {/* Mock data shortcut */}
                  <Button
                    variant="outline"
                    onClick={() => setDraftStudents([...draftStudents, ...MOCK_CLASS])}
                    className="h-11 rounded-2xl border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 shrink-0"
                  >
                    <Database className="h-4 w-4" />
                  </Button>
                </div>

                {/* Student list with strict height */}
                <div className="flex-1 min-h-[200px] max-h-[40vh] overflow-y-auto bg-zinc-50/50 rounded-3xl p-4 no-scrollbar border border-zinc-100">
                  {draftStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                      <Users className="h-12 w-12 mb-2 opacity-10" />
                      <p className="text-sm font-medium">No students added yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                      {draftStudents.map((student, index) => (
                        <div key={student.id || index} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm border border-zinc-50 group">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={student.photo_preview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                              <AvatarFallback>{student.first_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-bold text-sm truncate max-w-[100px]">
                              {student.first_name} {student.last_name}
                            </span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => removeDraftStudent(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {currentWizardStep === 3 && (
              <Step3Groups onContinue={handleFinish} />
            )}
          </div>
        </div>

        <DialogFooter className="bg-zinc-50/50 p-6 border-t border-zinc-100 shrink-0">
          <div className="flex items-center justify-between w-full">
            <Button variant="ghost" onClick={prevStep} disabled={currentWizardStep === 1 || isSaving} className="rounded-2xl font-bold text-zinc-500">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            {currentWizardStep < 3 && (
              <Button onClick={nextStep} disabled={currentWizardStep === 1 && (!draftWeekDetails.code || !draftWeekDetails.institute_name)} className="rounded-2xl px-8 font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-200">
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WizardModal;