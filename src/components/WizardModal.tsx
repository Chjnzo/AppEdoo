"use client";

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft, Check, Users, ClipboardList, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WizardModal = ({ open, onOpenChange }: WizardModalProps) => {
  const [step, setStep] = useState(1);

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const steps = [
    { id: 1, title: 'Registry', icon: ClipboardList },
    { id: 2, title: 'Students', icon: Users },
    { id: 3, title: 'Groups', icon: LayoutGrid },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-[2.5rem] border-white/20 bg-white/80 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              {steps.map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    step >= s.id ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-400"
                  )}>
                    {step > s.id ? <Check className="h-4 w-4" /> : s.id}
                  </div>
                  <span className={cn(
                    "text-xs font-bold uppercase tracking-wider",
                    step === s.id ? "text-zinc-900" : "text-zinc-400"
                  )}>
                    {s.title}
                  </span>
                  {s.id < 3 && <div className="w-8 h-[1px] bg-zinc-100 mx-2" />}
                </div>
              ))}
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {step === 1 && "Create New Week"}
              {step === 2 && "Add Students"}
              {step === 3 && "Assign Groups"}
            </DialogTitle>
            <DialogDescription className="text-zinc-500">
              {step === 1 && "Enter the basic information for this educational week."}
              {step === 2 && "Upload photos and details for each student."}
              {step === 3 && "Organize your students into working groups."}
            </DialogDescription>
          </DialogHeader>

          <div className="min-h-[240px] py-4">
            {step === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-bold text-zinc-700">Week Code</Label>
                  <Input id="code" placeholder="e.g. WK-2024-01" className="h-12 rounded-2xl bg-zinc-50 border-zinc-100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="institute" className="text-sm font-bold text-zinc-700">Institute Name</Label>
                  <Input id="institute" placeholder="e.g. Silicon Valley Academy" className="h-12 rounded-2xl bg-zinc-50 border-zinc-100" />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-20 h-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 flex items-center justify-center">
                  <Users className="h-8 w-8 text-zinc-300" />
                </div>
                <p className="text-sm text-zinc-500 font-medium">Student list placeholder...</p>
                <Button variant="outline" className="rounded-2xl border-zinc-200">Upload CSV</Button>
              </div>
            )}

            {step === 3 && (
              <div className="flex flex-col items-center justify-center h-full space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="w-20 h-20 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 flex items-center justify-center">
                  <LayoutGrid className="h-8 w-8 text-zinc-300" />
                </div>
                <p className="text-sm text-zinc-500 font-medium">Group assignment placeholder...</p>
                <Button variant="outline" className="rounded-2xl border-zinc-200">Auto-generate Groups</Button>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="bg-zinc-50/50 p-6 border-t border-zinc-100">
          <div className="flex items-center justify-between w-full">
            <Button 
              variant="ghost" 
              onClick={prevStep} 
              disabled={step === 1}
              className="rounded-2xl font-bold text-zinc-500"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            
            {step < 3 ? (
              <Button 
                onClick={nextStep}
                className="rounded-2xl px-8 font-bold bg-zinc-900 hover:bg-zinc-800 text-white shadow-lg shadow-zinc-200"
              >
                Next <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={() => onOpenChange(false)}
                className="rounded-2xl px-8 font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-xl shadow-indigo-200"
              >
                Finish <Check className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WizardModal;