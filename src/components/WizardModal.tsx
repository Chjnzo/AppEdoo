"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, Check, Users, ClipboardList, LayoutGrid, Plus, Trash2, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/useAppStore';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';
import Step3Groups from '@/components/wizard/Step3Groups';

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
    addDraftStudent,
    removeDraftStudent,
    draftGroups,
    setDraftGroups,
    resetWizard 
  } = useAppStore();

  const [newStudent, setNewStudent] = useState({ first_name: '', last_name: '' });
  const [isSaving, setIsSaving] = useState(false);

  const nextStep = () => setWizardStep(Math.min(currentWizardStep + 1, 3));
  const prevStep = () => setWizardStep(Math.max(currentWizardStep - 1, 1));

  const handleAddStudent = () => {
    if (newStudent.first_name && newStudent.last_name) {
      addDraftStudent(newStudent);
      setNewStudent({ first_name: '', last_name: '' });
    }
  };

  const handleAddGroup = () => {
    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-indigo-500', 'bg-violet-500'];
    const nextColor = colors[draftGroups.length % colors.length];
    setDraftGroups([...draftGroups, { name: `Group ${draftGroups.length + 1}`, color: nextColor }]);
  };

  const handleFinish = async () => {
    if (!draftWeekDetails.code || !draftWeekDetails.institute_name) {
      showError("Please fill in all required fields");
      return;
    }

    setIsSaving(true);
    const toastId = showLoading("Creating your educational week...");

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

      // 2. Create Groups
      const groupsToInsert = draftGroups.map(g => ({ 
        name: g.name || 'Unnamed Group', 
        color: g.color || 'bg-zinc-500', 
        week_id: week.id 
      }));

      const { data: createdGroups, error: groupsError } = await (supabase
        .from('groups') as any)
        .insert(groupsToInsert)
        .select();

      if (groupsError || !createdGroups) throw groupsError || new Error("Failed to create groups");

      // 3. Create Students
      const studentsToInsert = draftStudents.map((s, index) => {
        const groupId = createdGroups[index % createdGroups.length]?.id;
        return { 
          first_name: s.first_name || '', 
          last_name: s.last_name || '', 
          week_id: week.id, 
          group_id: groupId 
        };
      });

      const { error: studentsError } = await (supabase
        .from('students') as any)
        .insert(studentsToInsert);

      if (studentsError) throw studentsError;

      showSuccess("Week created successfully!");
      handleClose(false);
    } catch (error: any) {
      console.error("Error creating week:", error);
      showError(error.message || "Failed to create week");
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
      <DialogContent className="sm:max-w-[700px] rounded-[2.5rem] border-white/20 bg-white/80 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 overflow-hidden">
        <DialogHeader className="p-8">
          <DialogTitle className="text-2xl font-bold tracking-tight">
            {currentWizardStep === 1 && "Create New Week"}
            {currentWizardStep === 2 && "Add Students"}
            {currentWizardStep === 3 && "Assign Groups"}
          </DialogTitle>
        </DialogHeader>
        <div className="p-8">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
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

          <div className="min-h-[350px] py-4">
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
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Input 
                      placeholder="First Name" 
                      className="h-12 rounded-2xl bg-zinc-50 border-zinc-100"
                      value={newStudent.first_name}
                      onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Input 
                      placeholder="Last Name" 
                      className="h-12 rounded-2xl bg-zinc-50 border-zinc-100"
                      value={newStudent.last_name}
                      onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                    />
                  </div>
                  <Button 
                    onClick={handleAddStudent}
                    className="h-12 w-12 rounded-2xl bg-zinc-900 text-white"
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>

                <div className="bg-zinc-50/50 rounded-3xl p-4 max-h-[240px] overflow-y-auto no-scrollbar border border-zinc-100">
                  {draftStudents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                      <UserPlus className="h-8 w-8 mb-2 opacity-20" />
                      <p className="text-sm font-medium">No students added yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {draftStudents.map((student, index) => (
                        <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-zinc-50">
                          <span className="font-bold text-sm">{student.first_name} {student.last_name}</span>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                            onClick={() => removeDraftStudent(index)}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <DialogFooter className="bg-zinc-50/50 p-6 border-t border-zinc-100">
          <div className="flex items-center justify-between w-full">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={currentWizardStep === 1 || isSaving}
              className="rounded-2xl font-bold text-zinc-500"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {currentWizardStep < 3 ? (
              <Button 
                onClick={nextStep}
                disabled={currentWizardStep === 1 && (!draftWeekDetails.code || !draftWeekDetails.institute_name)}
                className="rounded-2xl px-8 font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-200"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleFinish}
                disabled={isSaving || draftGroups.length === 0}
                className="rounded-2xl px-8 font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-200"
              >
                {isSaving ? "Saving..." : "Finish"} <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WizardModal;