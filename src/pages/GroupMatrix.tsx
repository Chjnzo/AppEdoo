"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { Student, Group, Evaluation } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Minus, CheckCircle2, Loader2, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showSuccess, showError } from '@/utils/toast';
import { Badge } from '@/components/ui/badge';

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

interface ExtendedEvaluation extends Evaluation {
  type: 'plus' | 'minus';
  note: string;
  sub_criterion_id: string;
}

const GroupMatrix = () => {
  const { weekId, groupId } = useParams<{ weekId: string; groupId: string }>();
  const [selectedSkill, setSelectedSkill] = useState<string | null>('panoramica');
  const [students, setStudents] = useState<Student[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [evaluations, setEvaluations] = useState<ExtendedEvaluation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!groupId) return;
    setIsLoading(true);
    
    // Fetch students and group
    const fetchData = async () => {
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
        
        if (studentsData) {
          setStudents(studentsData);
          
          // Fetch evaluations for this group
          const studentIds = studentsData.map(s => s.id);
          const { data: evalData } = await supabase
            .from('evaluations')
            .select('*')
            .in('student_id', studentIds);
          
          if (evalData) setEvaluations(evalData as ExtendedEvaluation[]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [groupId]);

  // Calculate plus/minus counts for Overview
  const getSkillCounts = (studentId: string, skillId: string) => {
    const plus = evaluations.filter(e => 
      e.student_id === studentId && 
      e.skill_id === skillId && 
      e.type === 'plus'
    ).length;
    
    const minus = evaluations.filter(e => 
      e.student_id === studentId && 
      e.skill_id === skillId && 
      e.type === 'minus'
    ).length;
    
    return { plus, minus };
  };

  // Handle Plus/Minus actions
  const handlePlusMinus = async (studentId: string, skillId: string, subCriterionId: string, type: 'plus' | 'minus') => {
    const note = prompt("Inserisci motivo per questa valutazione");
    if (!note) return;
    
    const newEvaluation = {
      student_id: studentId,
      skill_id: skillId,
      sub_criterion_id: subCriterionId,
      type,
      note,
      score_value: type === 'plus' ? 1 : -1,
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabase
      .from('evaluations')
      .insert(newEvaluation as any);
    
    if (error) {
      showError("Errore durante il salvataggio");
      return;
    }
    
    showSuccess("Valutazione salvata");
    // Re-fetch data
    const studentIds = students.map(s => s.id);
    const { data: evalData } = await supabase
      .from('evaluations')
      .select('*')
      .in('student_id', studentIds);
    
    if (evalData) setEvaluations(evalData as ExtendedEvaluation[]);
  };

  // Overview Matrix data processing
  const overviewData = () => {
    if (!students.length || !evaluations.length) return [];
    
    const studentSkills = students.map(student => {
      const skills = Object.keys(SKILLS_DATA).map(skill => {
        const evaluationsForSkill = evaluations.filter(e => 
          e.student_id === student.id && 
          e.skill_id === skill
        );
        
        const plus = evaluationsForSkill.filter(e => e.type === 'plus').length;
        const minus = evaluationsForSkill.filter(e => e.type === 'minus').length;
        
        return {
          skill,
          plus,
          minus
        };
      });
      
      return { id: student.id, name: `${student.first_name} ${student.last_name}`, skills };
    });
    
    return studentSkills;
  };

  // Sheet content for history
  const getHistory = (studentId: string, skillId: string) => {
    return evaluations.filter(e => 
      e.student_id === studentId && 
      e.skill_id === skillId
    ).map(evaluation => ({
      date: new Date(evaluation.updated_at).toLocaleDateString('it-IT'),
      type: evaluation.type,
      subCriterion: SKILLS_DATA[skillId as SkillKey][0], // Using first sub-criterion for demo
      note: evaluation.note
    }));
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 bg-white shadow-sm border border-zinc-100">
              <ChevronLeft className="h-6 w-6" />
            </Button>
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
            onClick={() => handlePlusMinus(students[0]?.id || '', 'MOTIVAZIONE', 'Affronta i problemi con atteggiamento positivo', 'plus')}
            disabled={!students.length}
            className="rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 h-12 shadow-lg shadow-indigo-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Plus className="h-5 w-5" />
            Plus
          </Button>
          <Button 
            onClick={() => handlePlusMinus(students[0]?.id || '', 'MOTIVAZIONE', 'Affronta i problemi con atteggiamento positivo', 'minus')}
            disabled={!students.length}
            className="rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold px-6 h-12 shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-50"
          >
            <Minus className="h-5 w-5" />
            Minus
          </Button>
        </div>

        {/* Skill Selection Sidebar */}
        <div className="w-72 shrink-0 flex flex-col gap-3 overflow-y-auto no-scrollbar pr-2">
          <Button 
            onClick={() => setSelectedSkill('panoramica')}
            className={cn(
              "flex items-center justify-between p-5 rounded-[2rem] transition-all duration-500 text-left group",
              selectedSkill === 'panoramica' 
                ? "bg-zinc-900 text-white shadow-2xl shadow-zinc-200 scale-[1.02]" 
                : "bg-white/70 backdrop-blur-xl text-zinc-500 hover:bg-white border border-zinc-100"
            )}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-1">Overview</span>
              <span className="font-black text-sm tracking-tight">Panoramica</span>
            </div>
            <div className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
              selectedSkill === 'panoramica' ? "bg-white/10" : "bg-zinc-50 group-hover:bg-zinc-100"
            )}>
              <CheckCircle2 className={cn("h-4 w-4", selectedSkill === 'panoramica' ? "text-white" : "text-zinc-300")} />
            </div>
          </Button>
          
          {(Object.keys(SKILLS_DATA) as SkillKey[]).map((skill) => (
            <Button 
              key={skill}
              onClick={() => setSelectedSkill(skill)}
              className={cn(
                "flex items-center justify-between p-5 rounded-[2rem] transition-all duration-500 text-left group",
                selectedSkill === skill 
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
                selectedSkill === skill ? "bg-white/10" : "bg-zinc-50 group-hover:bg-zinc-100"
              )}>
                <CheckCircle2 className={cn("h-4 w-4", selectedSkill === skill ? "text-white" : "text-zinc-300")} />
              </div>
            </Button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-6 pb-12">
          {selectedSkill === 'panoramica' ? (
            <Card className="rounded-[2.5rem] border-none bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-2xl font-bold">Overview Matrix</CardTitle>
              </CardHeader>
              <div className="overflow-x-auto">
                <table className="w-full min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 bg-zinc-50 text-zinc-500">Student</th>
                      {Object.keys(SKILLS_DATA).map(skill => (
                        <th key={skill} className="px-4 py-2 bg-zinc-50 text-zinc-500">
                          {skill}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {overviewData().map(student => (
                      <tr key={student.id}>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <Users className="h-6 w-6" />
                            <span className="text-sm font-bold">{student.name}</span>
                          </div>
                        </td>
                        {Object.keys(SKILLS_DATA).map(skill => {
                          const { plus, minus } = getSkillCounts(student.id, skill);
                          return (
                            <td key={skill} className="px-4 py-2">
                              {plus > 0 && (
                                <Badge className="bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  {plus} Più
                                </Badge>
                              )}
                              {minus > 0 && (
                                <Badge className="bg-red-100 text-red-700 px-2 py-1 rounded-full">
                                  {minus} Meno
                                </Badge>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <div className="flex flex-col gap-4">
              {students.map((student, studentIndex) => (
                <Card key={student.id} className="rounded-[2.5rem] border-none bg-white/70 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                  <CardHeader className="p-4">
                    <CardTitle className="text-xl font-bold">
                      {student.first_name} {student.last_name}
                    </CardTitle>
                  </CardHeader>
                  <div className="p-4 space-y-4">
                    {Object.keys(SKILLS_DATA).map((skill, skillIndex) => (
                      <div key={`${student.id}-${skill}`} className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sub-criterion</span>
                          <span className="font-black text-sm tracking-tight">{SKILLS_DATA[skill as SkillKey][skillIndex]}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            onClick={() => handlePlusMinus(student.id, skill, SKILLS_DATA[skill as SkillKey][skillIndex], 'plus')}
                            className="h-12 w-12 rounded-2xl bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                          >
                            <Plus className="h-5 w-5" />
                            Plus
                          </Button>
                          <Button 
                            onClick={() => handlePlusMinus(student.id, skill, SKILLS_DATA[skill as SkillKey][skillIndex], 'minus')}
                            className="h-12 w-12 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 shadow-lg shadow-red-100 transition-all active:scale-95"
                          >
                            <Minus className="h-5 w-5" />
                            Minus
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default GroupMatrix;