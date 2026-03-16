"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { Student, Group, Evaluation } from '@/types/database';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
    'Autoregola il proprio atteggiamento',
    'Sostiene il gruppo',
    'È orientato all\'obiettivo del gruppo',
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

const SKILL_COLORS: Record<string, string> = {
  MOTIVAZIONE:    'from-amber-50 to-orange-50 border-amber-100',
  ORGANIZZAZIONE: 'from-sky-50 to-blue-50 border-sky-100',
  AUTONOMIA:      'from-violet-50 to-purple-50 border-violet-100',
  RELAZIONE:      'from-rose-50 to-pink-50 border-rose-100',
  LEADERSHIP:     'from-emerald-50 to-teal-50 border-emerald-100',
  AUTOVALUTAZIONE:'from-indigo-50 to-slate-50 border-indigo-100',
};

const SKILL_ACCENT: Record<string, string> = {
  MOTIVAZIONE:    'text-amber-600 bg-amber-100',
  ORGANIZZAZIONE: 'text-sky-600 bg-sky-100',
  AUTONOMIA:      'text-violet-600 bg-violet-100',
  RELAZIONE:      'text-rose-600 bg-rose-100',
  LEADERSHIP:     'text-emerald-600 bg-emerald-100',
  AUTOVALUTAZIONE:'text-indigo-600 bg-indigo-100',
};

// ── Skill card with expandable notes ──────────────────────────────────────────
const SkillCard = ({
  skill,
  criteria,
  evaluations,
}: {
  skill: string;
  criteria: string[];
  evaluations: Evaluation[];
}) => {
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);

  // All events for a sub-criterion, oldest-first
  const getEvals = (criterion: string) =>
    evaluations
      .filter(e => e.sub_criterion_id === criterion)
      .sort((a, b) => new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime());

  // Header badge: count of plus events (never cancelled by minuses)
  const totalPlus = criteria.reduce(
    (sum, c) => sum + evaluations.filter(e => e.sub_criterion_id === c && e.score_value > 0).length,
    0
  );

  return (
    <Card className={cn(
      'rounded-3xl border bg-gradient-to-br shadow-sm',
      SKILL_COLORS[skill] ?? 'from-zinc-50 to-white border-zinc-100'
    )}>
      <CardHeader className="p-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn('w-7 h-7 rounded-xl flex items-center justify-center', SKILL_ACCENT[skill] ?? 'text-zinc-500 bg-zinc-100')}>
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <CardTitle className="text-sm font-black tracking-widest uppercase text-zinc-800">
              {skill}
            </CardTitle>
          </div>
          {totalPlus > 0 && (
            <span className={cn('text-xs font-black px-2.5 py-0.5 rounded-full', SKILL_ACCENT[skill] ?? 'text-zinc-500 bg-zinc-100')}>
              +{totalPlus}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-0 space-y-2">
        {criteria.map((criterion, idx) => {
          const evs      = getEvals(criterion);
          const hasNotes = evs.some(e => e.note);
          const isOpen   = expandedCriterion === criterion;

          return (
            <div key={idx} className="rounded-2xl bg-white/70 border border-white/80 overflow-hidden shadow-sm">
              {/* Criterion row */}
              <button
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white/90 transition-colors"
                onClick={() => setExpandedCriterion(isOpen ? null : criterion)}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-[10px] font-black text-zinc-400 shrink-0">{idx + 1}</span>
                  <span className="text-xs font-bold text-zinc-700 leading-snug truncate">{criterion}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Visual tally — one badge per event, chronological, never compensating */}
                  {evs.length > 0 && (
                    <div className="flex flex-wrap gap-1 max-w-[80px] justify-end">
                      {evs.map(ev =>
                        ev.score_value > 0
                          ? <Badge key={ev.id} variant="outline" className="bg-green-50 text-green-600 border-green-200 px-1.5 font-black text-[10px]">+</Badge>
                          : <Badge key={ev.id} variant="outline" className="bg-red-50 text-red-600 border-red-200 px-1.5 font-black text-[10px]">−</Badge>
                      )}
                    </div>
                  )}
                  {hasNotes && (
                    isOpen
                      ? <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
                      : <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                  )}
                </div>
              </button>

              {/* Notes accordion — all notes in chronological order */}
              {isOpen && hasNotes && (
                <div className="px-4 pb-3 pt-2 border-t border-white/60 space-y-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Diario di Bordo</p>
                  {evs.filter(e => e.note).map(ev => (
                    <div key={ev.id} className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={ev.score_value > 0
                            ? 'bg-green-50 text-green-600 border-green-200 px-1.5 font-black text-[10px]'
                            : 'bg-red-50 text-red-600 border-red-200 px-1.5 font-black text-[10px]'}
                        >
                          {ev.score_value > 0 ? '+' : '−'}
                        </Badge>
                        <span className="text-[10px] text-zinc-400">
                          {new Date(ev.updated_at).toLocaleDateString('it-IT', {
                            day: 'numeric', month: 'long', year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 leading-relaxed">{ev.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// ── Page ───────────────────────────────────────────────────────────────────────
const StudentDetail = () => {
  const { weekId, studentId } = useParams<{ weekId: string; studentId: string }>();

  const [student, setStudent] = useState<Student | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!studentId || !weekId) return;
      setIsLoading(true);
      try {
        // Student
        const { data: studentData, error: studentError } = await (supabase
          .from('students') as any)
          .select('*')
          .eq('id', studentId)
          .single();
        if (studentError) throw studentError;
        setStudent(studentData);

        // Group
        if (studentData?.group_id) {
          const { data: groupData } = await (supabase
            .from('groups') as any)
            .select('*')
            .eq('id', studentData.group_id)
            .single();
          if (groupData) setGroup(groupData);
        }

        // Evaluations
        const { data: evalData, error: evalError } = await (supabase
          .from('evaluations') as any)
          .select('*')
          .eq('student_id', studentId);
        if (evalError) throw evalError;
        setEvaluations(evalData ?? []);
      } catch (err: any) {
        setError(err.message || 'Failed to load student');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [studentId, weekId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-indigo-100 rounded-full animate-pulse" />
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest animate-pulse">Loading Profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !student) {
    return (
      <AppLayout>
        <div className="h-full w-full flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center">
            <AlertCircle className="h-10 w-10 text-rose-500" />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-extrabold text-zinc-900">Student Not Found</h2>
            <p className="text-zinc-500 max-w-xs mx-auto">The student profile you're looking for doesn't exist.</p>
          </div>
          <Link to={`/week/${weekId}`}>
            <Button className="rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 h-12">
              <ChevronLeft className="mr-2 h-4 w-4" /> Back to Week
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <Link to={`/week/${weekId}`}>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-2xl h-14 w-14 bg-white shadow-sm border border-zinc-100 hover:scale-105 transition-transform"
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          </Link>

          {/* Student identity */}
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar className="h-20 w-20 border-4 border-white shadow-xl">
                <AvatarImage
                  src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`}
                />
                <AvatarFallback className="text-2xl font-black">
                  {student.first_name?.[0]}
                </AvatarFallback>
              </Avatar>
              {group && (
                <div className={cn('absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white', group.color)} />
              )}
            </div>

            <div className="space-y-1">
              <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 leading-none">
                {student.first_name} {student.last_name}
              </h2>
              <div className="flex items-center gap-2">
                {group && (
                  <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white', group.color)}>
                    {group.name}
                  </span>
                )}
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Scheda Studente</span>
              </div>
            </div>
          </div>

          {/* Summary badge */}
          <div className="md:ml-auto bg-white/50 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 flex items-center gap-8 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Valutazioni</span>
              <span className="text-xl font-black text-zinc-900">{evaluations.length}</span>
            </div>
            <div className="w-[1px] h-8 bg-zinc-200" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Totale Plus</span>
              <span className="text-xl font-black text-emerald-600">
                +{evaluations.filter(e => e.score_value > 0).length}
              </span>
            </div>
          </div>
        </div>

        {/* Skill Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(SKILLS_DATA).map(([skill, criteria]) => (
            <SkillCard
              key={skill}
              skill={skill}
              criteria={criteria}
              evaluations={evaluations.filter(e => e.skill_id === skill)}
            />
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDetail;
