"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { Student, Group, Evaluation } from '@/types/database';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  ChevronLeft,
  Plus,
  Minus,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess, showError, showLoading, dismissToast } from '@/utils/toast';

// ── Skills definition ──────────────────────────────────────────────────────────
const SKILLS_DATA: Record<string, string[]> = {
  MOTIVAZIONE: [
    'Affronta i problemi con atteggiamento positivo',
    'Porta a termine il lavoro con costanza',
    'Si attiva per superare le difficoltà',
  ],
  ORGANIZZAZIONE: [
    'Mantiene lo spazio di lavoro ordinato',
    'Gestione del tempo',
    'Riconosce il processo di lavoro',
  ],
  AUTONOMIA: [
    'Non ha paura di sbagliare',
    'È attivo, propositivo e prende decisioni',
    'Cerca strade alternative',
  ],
  RELAZIONE: [
    "Autoregola il proprio atteggiamento",
    "Sostiene il gruppo",
    "È orientato all'obiettivo del gruppo",
  ],
  LEADERSHIP: [
    'Assertività',
    'Problematizza',
    'Fa sintesi',
  ],
  AUTOVALUTAZIONE: [
    'Riconosce punti di forza e debolezza',
    'Accoglie il feedback come crescita',
    'Cerca modi per migliorare',
  ],
};

const SKILL_META: Record<string, {
  abbr: string;
  pill: string;
  pillActive: string;
  accent: string;
}> = {
  MOTIVAZIONE:    { abbr: 'MOT',   pill: 'bg-amber-50 text-amber-600 border-amber-200',      pillActive: 'bg-amber-500 text-white border-amber-500',      accent: 'text-amber-600'   },
  ORGANIZZAZIONE: { abbr: 'ORG',   pill: 'bg-sky-50 text-sky-600 border-sky-200',            pillActive: 'bg-sky-500 text-white border-sky-500',            accent: 'text-sky-600'     },
  AUTONOMIA:      { abbr: 'AUTON', pill: 'bg-violet-50 text-violet-600 border-violet-200',   pillActive: 'bg-violet-500 text-white border-violet-500',   accent: 'text-violet-600'  },
  RELAZIONE:      { abbr: 'REL',   pill: 'bg-rose-50 text-rose-600 border-rose-200',         pillActive: 'bg-rose-500 text-white border-rose-500',         accent: 'text-rose-600'    },
  LEADERSHIP:     { abbr: 'LEAD',  pill: 'bg-emerald-50 text-emerald-600 border-emerald-200',pillActive: 'bg-emerald-500 text-white border-emerald-500',  accent: 'text-emerald-600' },
  AUTOVALUTAZIONE:{ abbr: 'AUTOV', pill: 'bg-indigo-50 text-indigo-600 border-indigo-200',   pillActive: 'bg-indigo-500 text-white border-indigo-500',   accent: 'text-indigo-600'  },
};

// ── Types ──────────────────────────────────────────────────────────────────────
interface EvalContext {
  studentId: string;
  studentName: string;
  skillId: string;
  subCriterionId: string;
  type: 'plus' | 'minus';
}

// ── StudentAssessmentCard ──────────────────────────────────────────────────────
interface StudentCardProps {
  student: Student;
  evaluations: Evaluation[];
  onEvalRequest: (ctx: EvalContext) => void;
}

const StudentAssessmentCard = ({ student, evaluations, onEvalRequest }: StudentCardProps) => {
  const [activeSkill, setActiveSkill] = useState<string | null>(null);

  // Returns all events for a sub-criterion in chronological order
  const eventsFor = (sub: string) =>
    evaluations
      .filter(e => e.sub_criterion_id === sub)
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());

  // Pill summary: count of plus events across all sub-criteria for a skill
  const totalPlusForSkill = (skill: string) =>
    SKILLS_DATA[skill].reduce(
      (sum, c) => sum + evaluations.filter(e => e.sub_criterion_id === c && e.score_value > 0).length,
      0
    );

  return (
    <Card className="rounded-[2.5rem] border-none bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] overflow-hidden">
      <CardContent className="p-6">
        {/* Top Row: avatar + name + skill pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Identity */}
          <div className="flex items-center gap-3 sm:w-48 shrink-0">
            <Avatar className="h-12 w-12 border-2 border-white shadow-md">
              <AvatarImage src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
              <AvatarFallback className="font-bold">{student.first_name[0]}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-black text-sm text-zinc-900 leading-tight truncate">{student.first_name}</p>
              <p className="text-xs font-bold text-zinc-400 truncate">{student.last_name}</p>
            </div>
          </div>

          {/* Skill pills */}
          <div className="flex flex-wrap gap-2 flex-1">
            {Object.keys(SKILLS_DATA).map((skill) => {
              const meta = SKILL_META[skill];
              const total = totalPlusForSkill(skill);
              const isActive = activeSkill === skill;
              return (
                <button
                  key={skill}
                  onClick={() => setActiveSkill(isActive ? null : skill)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all duration-200',
                    isActive ? meta.pillActive : meta.pill
                  )}
                >
                  {meta.abbr}
                  {total > 0 && (
                    <span className={cn(
                      'text-[9px] font-black px-1 rounded-full',
                      isActive ? 'bg-white/25 text-white' : 'bg-white/80'
                    )}>
                      +{total}
                    </span>
                  )}
                  {isActive
                    ? <ChevronUp className="h-3 w-3" />
                    : <ChevronDown className="h-3 w-3" />
                  }
                </button>
              );
            })}
          </div>
        </div>

        {/* Expanded criteria area */}
        {activeSkill && (
          <div className="mt-5 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="h-[1px] bg-zinc-100 mb-4" />
            <div className="space-y-3">
              {SKILLS_DATA[activeSkill].map((criterion, idx) => {
                const events = eventsFor(criterion);
                const meta   = SKILL_META[activeSkill];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-4 p-4 bg-zinc-50/60 rounded-2xl border border-zinc-100/80 hover:bg-white transition-colors"
                  >
                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <span className={cn('text-[10px] font-black uppercase tracking-widest block mb-0.5', meta.accent)}>
                        Criterio {idx + 1}
                      </span>
                      <p className="text-sm font-bold text-zinc-700 leading-snug">{criterion}</p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Visual tally — one badge per event, chronological, never compensating */}
                      {events.length > 0 && (
                        <div className="flex flex-wrap gap-1 max-w-[96px] justify-end">
                          {events.map(ev =>
                            ev.score_value > 0
                              ? <Badge key={ev.id} variant="outline" className="bg-green-50 text-green-600 border-green-200 px-1.5 font-black text-xs">+</Badge>
                              : <Badge key={ev.id} variant="outline" className="bg-red-50 text-red-600 border-red-200 px-1.5 font-black text-xs">−</Badge>
                          )}
                        </div>
                      )}

                      {/* Minus button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEvalRequest({
                          studentId: student.id,
                          studentName: `${student.first_name} ${student.last_name}`,
                          skillId: activeSkill,
                          subCriterionId: criterion,
                          type: 'minus',
                        })}
                        className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-zinc-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all active:scale-90"
                      >
                        <Minus className="h-5 w-5" />
                      </Button>

                      {/* Plus button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEvalRequest({
                          studentId: student.id,
                          studentName: `${student.first_name} ${student.last_name}`,
                          skillId: activeSkill,
                          subCriterionId: criterion,
                          type: 'plus',
                        })}
                        className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-zinc-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all active:scale-90"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ── GroupMatrix page ───────────────────────────────────────────────────────────
const GroupMatrix = () => {
  const { weekId, groupId } = useParams<{ weekId: string; groupId: string }>();

  const [students,    setStudents]    = useState<Student[]>([]);
  const [group,       setGroup]       = useState<Group | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading,   setIsLoading]   = useState(true);

  const [selectedEvalContext, setSelectedEvalContext] = useState<EvalContext | null>(null);
  const [noteText,  setNoteText]  = useState('');
  const [isSaving,  setIsSaving]  = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId) return;
      setIsLoading(true);
      try {
        // Group
        const { data: groupData } = await (supabase.from('groups') as any)
          .select('*')
          .eq('id', groupId)
          .single();
        if (groupData) setGroup(groupData);

        // Students
        const { data: studentsData } = await (supabase.from('students') as any)
          .select('*')
          .eq('group_id', groupId);

        if (studentsData && studentsData.length > 0) {
          setStudents(studentsData);
          // All evaluations for these students
          const { data: evalData } = await (supabase.from('evaluations') as any)
            .select('*')
            .in('student_id', studentsData.map((s: Student) => s.id))
            .order('updated_at', { ascending: false });
          if (evalData) setEvaluations(evalData);
        } else {
          setStudents([]);
        }
      } catch (error) {
        console.error('Error fetching matrix data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  const handleDialogClose = () => {
    setSelectedEvalContext(null);
    setNoteText('');
  };

  const handleSaveEvaluation = async () => {
    if (!selectedEvalContext || !noteText.trim()) return;
    setIsSaving(true);
    const toastId = showLoading('Salvataggio...');
    try {
      const newRecord = {
        student_id:      selectedEvalContext.studentId,
        skill_id:        selectedEvalContext.skillId,
        sub_criterion_id: selectedEvalContext.subCriterionId,
        score_value:     selectedEvalContext.type === 'plus' ? 1 : -1,
        note:            noteText.trim(),
        updated_at:      new Date().toISOString(),
      };

      const { data, error } = await (supabase.from('evaluations') as any)
        .insert(newRecord)
        .select()
        .single();

      if (error) throw error;

      // Optimistic update — no refetch needed
      if (data) setEvaluations(prev => [data, ...prev]);

      showSuccess('Valutazione salvata!');
      handleDialogClose();
    } catch (error: any) {
      console.error('Save error:', error);
      showError(error.message || 'Errore durante il salvataggio');
    } finally {
      setIsSaving(false);
      dismissToast(toastId);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full flex items-center justify-center">
          <Loader2 className="h-12 w-12 text-indigo-600 animate-spin" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">

        {/* Header */}
        <div className="flex items-center gap-6 shrink-0 flex-wrap">
          <Link to={`/week/${weekId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl h-12 w-12 bg-white shadow-sm border border-zinc-100 hover:scale-105 transition-transform"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={cn(
                'px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white',
                group?.color || 'bg-zinc-500'
              )}>
                {group?.name}
              </span>
              <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Valutazione</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Skill Assessment</h2>
          </div>

          <div className="ml-auto bg-white/50 border border-white/20 rounded-2xl px-5 py-2.5 flex items-center gap-6 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Studenti</span>
              <span className="text-lg font-black text-zinc-900">{students.length}</span>
            </div>
            <div className="w-[1px] h-7 bg-zinc-200" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Valutazioni</span>
              <span className="text-lg font-black text-zinc-900">{evaluations.length}</span>
            </div>
          </div>
        </div>

        {/* Student cards */}
        <div className="space-y-5 pb-12">
          {students.map(student => (
            <StudentAssessmentCard
              key={student.id}
              student={student}
              evaluations={evaluations.filter(e => e.student_id === student.id)}
              onEvalRequest={setSelectedEvalContext}
            />
          ))}

          {students.length === 0 && (
            <div className="h-64 flex flex-col items-center justify-center bg-white/40 rounded-[3rem] border-2 border-dashed border-zinc-200">
              <Users className="h-12 w-12 text-zinc-300 mb-4" />
              <p className="text-zinc-400 font-bold">Nessuno studente in questo gruppo</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Add Evaluation Dialog ── */}
      <Dialog open={!!selectedEvalContext} onOpenChange={(open) => !open && handleDialogClose()}>
        <DialogContent
          className="rounded-[2rem] border-white/20 bg-white/90 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] max-w-md"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="pb-1">
            <div className="mb-2">
              {selectedEvalContext && (
                <span className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider',
                  selectedEvalContext.type === 'plus'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-rose-100 text-rose-700'
                )}>
                  {selectedEvalContext.type === 'plus'
                    ? <Plus className="h-3 w-3" />
                    : <Minus className="h-3 w-3" />
                  }
                  {selectedEvalContext.type === 'plus' ? 'Più' : 'Meno'}
                </span>
              )}
            </div>
            <DialogTitle className="text-xl font-black text-zinc-900 leading-snug">
              {selectedEvalContext?.type === 'plus' ? 'Aggiungi Più' : 'Aggiungi Meno'} a{' '}
              <span className="text-indigo-600">{selectedEvalContext?.studentName}</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 leading-relaxed pt-1">
              {selectedEvalContext?.subCriterionId}
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-2">
            <Label htmlFor="eval-note" className="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center gap-1">
              Motivo <span className="text-rose-500">*</span>
            </Label>
            <Textarea
              id="eval-note"
              placeholder="Descrivi il motivo di questa valutazione..."
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSaveEvaluation();
              }}
              className="min-h-[100px] rounded-2xl bg-zinc-50 border-zinc-200 focus:border-indigo-300 resize-none text-sm font-medium"
              autoFocus
            />
            {noteText.length === 0 && (
              <p className="text-[11px] text-rose-500 font-bold">Il motivo è obbligatorio</p>
            )}
          </div>

          <DialogFooter className="gap-2 pt-1">
            <Button
              variant="ghost"
              onClick={handleDialogClose}
              disabled={isSaving}
              className="rounded-2xl font-bold text-zinc-500"
            >
              Annulla
            </Button>
            <Button
              onClick={handleSaveEvaluation}
              disabled={!noteText.trim() || isSaving}
              className={cn(
                'rounded-2xl font-bold px-6 shadow-lg transition-all active:scale-95 disabled:opacity-50',
                selectedEvalContext?.type === 'plus'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-100'
              )}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {selectedEvalContext?.type === 'plus'
                    ? <Plus className="h-4 w-4 mr-1.5" />
                    : <Minus className="h-4 w-4 mr-1.5" />
                  }
                  Salva Valutazione
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default GroupMatrix;
