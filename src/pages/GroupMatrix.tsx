"use client";

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { Student, Group } from '@/types/database';
import { useAppStore } from '@/store/useAppStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  ChevronLeft, 
  Plus, 
  Minus, 
  Sparkles, 
  CheckCircle2, 
  Loader2,
  Save,
  Users
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess } from '@/utils/toast';

const SKILLS_DATA = {
  'MOTIVAZIONE': [
    "Affronta i problemi con atteggiamento positivo",
    "Porta a termine il lavoro con costanza",
    "Si attiva per superare le difficoltà"
  ],
  'ORGANIZZAZIONE': [
    "Mantiene lo spazio di lavoro ordinato",
    "Gestione del tempo",
    "Riconosce il processo di lavoro"
  ],
  'AUTONOMIA': [
    "Non ha paura di sbagliare",
    "È attivo, propositivo e prende decisioni",
    "Cerca strade alternative"
  ],
  'RELAZIONE': [
    "Autoregola il proprio atteggiamento",
    "Sostiene il gruppo",
    "È orientato all'obiettivo del gruppo"
  ],
  'LEADERSHIP': [
    "Assertività",
    "Problematizza",
    "Fa sintesi"
  ],
  'AUTOVALUTAZIONE': [
    "Riconosce punti di forza e debolezza",
    "Accoglie il feedback come crescita",
    "Cerca modi per migliorare"
  ]
};

type SkillKey = keyof typeof SKILLS_DATA;

const GroupMatrix = () => {
  const { weekId, groupId } = useParams<{ weekId: string; groupId: string }>();
  const [activeSkill, setActiveSkill] = useState<SkillKey>('MOTIVAZIONE');
  const [students, setStudents] = useState<Student[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { pendingEvaluations, setPendingEvaluation } = useAppStore();

  useEffect(() => {
    const fetchData = async () => {
      if (!groupId) return;
      setIsLoading(true);
      
      try {
        const { data: groupData } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();
        
        if (groupData) setGroup(groupData);

        const { data: studentsData } = await supabase
          .from('students')
          .select('*')
          .eq('group_id', groupId);
        
        if (studentsData) setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching matrix data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  const handleScoreChange = (studentId: string, criterion: string, delta: number) => {
    const currentScore = pendingEvaluations[studentId]?.[criterion] || 0;
    const newScore = Math.max(0, currentScore + delta);
    setPendingEvaluation(studentId, criterion, newScore);
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
      <div className="h-full flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6">
            <Link to={`/week/${weekId}`}>
              <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-white shadow-sm border border-zinc-100">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={cn("px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider text-white", group?.color || "bg-zinc-500")}>
                  {group?.name}
                </span>
                <span className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Evaluation Matrix</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight text-zinc-900">Skill Assessment</h2>
            </div>
          </div>
          <Button 
            onClick={() => showSuccess("Evaluations saved locally")}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-12 shadow-lg shadow-indigo-100"
          >
            <Save className="mr-2 h-4 w-4" /> Save Progress
          </Button>
        </div>

        <div className="flex-1 flex gap-8 min-h-0">
          {/* Left Sidebar - Skill Selection */}
          <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto no-scrollbar pr-2">
            {(Object.keys(SKILLS_DATA) as SkillKey[]).map((skill) => (
              <button
                key={skill}
                onClick={() => setActiveSkill(skill)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-[2rem] transition-all duration-500 text-left group",
                  activeSkill === skill 
                    ? "bg-zinc-900 text-white shadow-2xl shadow-zinc-200 scale-[1.02]" 
                    : "bg-white/70 backdrop-blur-xl text-zinc-500 hover:bg-white border border-zinc-100"
                )}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-1">Skill</span>
                  <span className="font-black text-sm tracking-tight">{skill}</span>
                </div>
                <div className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                  activeSkill === skill ? "bg-white/10" : "bg-zinc-50 group-hover:bg-zinc-100"
                )}>
                  <Sparkles className={cn("h-4 w-4", activeSkill === skill ? "text-white" : "text-zinc-300")} />
                </div>
              </button>
            ))}
          </div>

          {/* Main Content - Student Matrix */}
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-12">
            {students.map((student) => (
              <Card key={student.id} className="rounded-[3rem] border-none bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Student Info */}
                    <div className="lg:w-64 shrink-0 flex flex-col items-center text-center space-y-4">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
                          <AvatarImage src={student.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.id}`} />
                          <AvatarFallback className="text-xl font-bold">{student.first_name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">{student.first_name} {student.last_name}</h3>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Student</p>
                      </div>
                    </div>

                    {/* Criteria Scoring */}
                    <div className="flex-1 space-y-6">
                      {SKILLS_DATA[activeSkill].map((criterion, idx) => {
                        const score = pendingEvaluations[student.id]?.[criterion] || 0;
                        return (
                          <div key={idx} className="flex items-center justify-between p-6 bg-zinc-50/50 rounded-[2rem] border border-zinc-100/50 group hover:bg-white hover:shadow-md transition-all duration-300">
                            <div className="flex-1 pr-8">
                              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block mb-1">Criterion {idx + 1}</span>
                              <p className="text-sm font-bold text-zinc-700 leading-relaxed">{criterion}</p>
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleScoreChange(student.id, criterion, -1)}
                                className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-zinc-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all active:scale-90"
                              >
                                <Minus className="h-5 w-5" />
                              </Button>
                              
                              <div className="w-16 h-16 bg-white rounded-[1.5rem] shadow-inner border border-zinc-100 flex items-center justify-center">
                                <span className="text-2xl font-black text-zinc-900">{score}</span>
                              </div>

                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleScoreChange(student.id, criterion, 1)}
                                className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-zinc-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all active:scale-90"
                              >
                                <Plus className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {students.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center bg-white/40 rounded-[3rem] border-2 border-dashed border-zinc-200">
                <Users className="h-12 w-12 text-zinc-300 mb-4" />
                <p className="text-zinc-400 font-bold">No students found in this group</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default GroupMatrix;